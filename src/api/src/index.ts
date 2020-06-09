import 'reflect-metadata';
import { createConnection, Brackets } from 'typeorm';
import bodyParser = require('body-parser');
import express = require('express');
import cors = require('cors');
import morgan = require('morgan');
import fileUpload = require('express-fileupload');
import path = require('path');

import { dbInit } from './db/initialize';
import { signUpHandler, signInHandler, checkTokenHandler, uploadImageHandler, filterOptionsHandler, filteredPropertiesHandler, removeImageHandler } from './actions';

// entities
import User from './db/entity/User';
import Property from './db/entity/Property';
import Locality from './db/entity/Locality';
import PropertyType from './db/entity/PropertyType';
import Reservation from './db/entity/Reservation';
import Image from './db/entity/Image';


createConnection().then(async (connection) => {
    if (!await dbInit(connection)) {
        throw "Databaze could not be initialized!";
    }
    const userRepository = connection.getRepository(User);
    const propertyRepository = connection.getRepository(Property);
    const propertyTypeRepository = connection.getRepository(PropertyType);
    const reservationRepository = connection.getRepository(Reservation);
    const localityRepository = connection.getRepository(Locality);
    const imageRepository = connection.getRepository(Image);

    const app = express();
    app.use(cors({credentials: true, origin: '*'}));
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    app.use(bodyParser.json());
    app.use(fileUpload({
        createParentPath: true
    }));
    app.use(morgan('dev'));

    /* ----- USERS ----- */
    app.get('/users', async (req, res) => {
        return res.send(await userRepository.find());
    });

    app.get('/users/:id', async (req, res) => {
        return res.send(await userRepository.findOne({ select: ["firstName", "lastName", "email"], where: { id: req.params.id } }));
    });
    /* ----- USERS END ----- */


    /* ----- PROPERTIES ----- */
    app.get('/properties', async (req, res) => {
        const properties = await propertyRepository.createQueryBuilder("p")
            .leftJoinAndSelect(Locality, "l", "p.localityID = l.id")
            .leftJoinAndSelect(PropertyType, "t", "p.typeID = t.id")
            .where("p.disabled = false")
            .orderBy("p.created", "DESC")
            .getRawMany();
            return res.send(properties);
    });

    app.get('/offers/:id', async (req, res) => {
        const properties = await propertyRepository.createQueryBuilder("p")
            .leftJoinAndSelect(Locality, "l", "p.localityID = l.id")
            .leftJoinAndSelect(PropertyType, "t", "p.typeID = t.id")
            .where("p.ownerID = :id", { id: req.params.id })
            .orderBy("p.created", "DESC")
            .getRawMany();
        return res.send(properties);
    });

    app.get('/property/:id', async (req, res) => {
        const property = await propertyRepository.createQueryBuilder("p")
            .leftJoinAndSelect(Locality, "l", "p.localityID = l.id")
            .leftJoinAndSelect(PropertyType, "t", "p.typeID = t.id")
            .where("p.id = :id", { id: req.params.id })
            .orderBy("p.created", "DESC")
            .getRawMany();
        const score = await reservationRepository.createQueryBuilder("r")
            .where("r.propertyID = :id", { id: req.params.id })
            .andWhere("r.canceled = false")
            .andWhere("r.score >= 0")
            .andWhere("r.dtStart < NOW()")
            .getRawMany();
        let sum = 0;
        score.forEach(i => {
            sum += Number(i.r_score);
        });
        property[0].score = { avg: score.length === 0 ? -1 : (sum / score.length).toFixed(1), len: score.length };
        return res.send(property);
    });

    app.put('/property', async (req, res) => {
        const property = new Property(
            req.body.locality,
            req.body.price,
            req.body.userID,
            req.body.capacity,
            req.body.type,
            req.body.title,
            req.body.description );
        await propertyRepository.save(property).then(issue => { res.send(issue) });
        return res.end();
    });

    app.post('/filteredProperties', (req, res) => filteredPropertiesHandler(req, res, propertyRepository, reservationRepository));

    app.put('/property/update/:id', async (req, res) => {
        const result = await propertyRepository.createQueryBuilder().update({
            localityID: req.body.locality,
            price: req.body.price,
            capacity: req.body.capacity,
            typeID: req.body.type,
            name: req.body.title,
            description: req.body.description,
        }).where("id = :id", { id: req.body.id }).execute();
        return res.send(result);
    });

    app.put('/property/disable/:id', async (req, res) => {
        const result = await propertyRepository.createQueryBuilder().update({
            disabled: true,
        }).where("id = :id", { id: req.params.id }).execute();
        return res.send(result);
    });

    app.put('/property/enable/:id', async (req, res) => {
        const result = await propertyRepository.createQueryBuilder().update({
            disabled: false,
        }).where("id = :id", { id: req.params.id }).execute();
        return res.send(result);
    });

    app.post('/checkAvailability/:id', async (req, res) => {
        const date = req.body.date;
        const count = (await reservationRepository.createQueryBuilder("r")
            .where(":id = r.propertyID", { id: req.params.id })
            .andWhere("r.canceled = false")
            .andWhere(new Brackets(qb => {
                qb.where(":from > r.dtStart AND :from < r.dtEnd OR :to > r.dtStart AND :to < r.dtEnd", { from: date.from, to: date.to})
                .orWhere("r.dtStart >= :from AND r.dtEnd <= :to", { from: date.from, to: date.to})
            }))
            .getCount());

        return res.send(!count);
    });

    app.delete('/property/:id', async (req, res) => {
        const property = await propertyRepository.delete(req.params.id);
        await reservationRepository.delete({ propertyID: req.params.id });
        return res.send(property);
    });
    /* ----- PROPERTIES END ----- */


    /* ----- LOCALITIES ----- */
    app.get('/localities', async (req, res) => {
        return res.send(await localityRepository.find());
    });

    app.put('/localities', async (req, res) => {
        await localityRepository.save(new Locality(req.body.name));
        return res.end();
    });
    /* ----- LOCALITIES END ----- */


    /* ----- PROPERT TYPES ----- */
    app.get('/propertyTypes', async (req, res) => {
        return res.send(await propertyTypeRepository.find());
    });
    /* ----- PROPERT TYPES END ----- */


    /* ----- RESERVATIONS ----- */
    app.get('/reservations', async (req, res) => {
        const reservations = await reservationRepository.find();
        return res.send(reservations);
    });

    app.get('/reservations/user-:id', async (req, res) => {
        const reservations = await reservationRepository.createQueryBuilder("reservation")
            .leftJoinAndSelect(Property, "property", "reservation.propertyID = property.id")
            .where(`reservation.customerID = ${req.params.id}`)
            .orderBy("reservation.created", "DESC")
            .getRawMany();
        return res.send(reservations);
    });

    app.get('/reservations/property-:id', async (req, res) => {
        const reservations = await reservationRepository.createQueryBuilder("reservation")
        .leftJoinAndSelect(Property, "property", "reservation.propertyID = property.id")
        .where(`reservation.propertyID = ${req.params.id}`)
        .orderBy("reservation.created", "DESC")
        .getRawMany();
        return res.send(reservations);
    });

    app.put('/reservation', async (req, res) => {
        const reservation = new Reservation(req.body.from, req.body.to, req.body.propertyID, req.body.customerID, req.body.totalPrice);
        reservationRepository.save(reservation);

        return res.end();
    });

    app.put('/reservation/setScore', async (req, res) => {
        console.log("id: " + req.body.id + " value: " + req.body.score);
        await reservationRepository.update(req.body.id, { score: Number(req.body.score) });
        return res.end();
    });

    app.delete('/reservations/:id', async (req, res) => {
        await reservationRepository.update(req.params.id, { canceled: true });
        return res.end();
    });
    /* ----- RESERVATIONS END ----- */

    /* ----- IMAGES ----- */
    app.get('/images', async (req, res) => {
        res.send(await imageRepository.find({ order: { path: 'ASC' } })); 
    });

    app.get('/images/property-:pID/:pID-:iID.:ext', async (req, res) => {
        const pid = req.params.pID;
        const targetPath = `/../images/property-${pid}/${pid}-${req.params.iID}.${req.params.ext}`;
        res.sendFile(path.resolve(__dirname + targetPath)); 
    });

    app.get('/images/property-:id', async (req, res) => {
        res.send(await imageRepository.find({ order: { path: 'ASC' }, where: { productID: req.params.id } })); 
    });

    app.get('/images/main/property-:id', async (req, res) => {
        res.send(await imageRepository.findOne({ order: { path: 'ASC' }, where: { productID: req.params.id }})); 
    });

    app.put('/upload/images-:id', (req, res) => uploadImageHandler(req, res, imageRepository));

    app.delete('/remove/images-:id', (req, res) => removeImageHandler(req, res, imageRepository));
    /* ----- IMAGES END ----- */

    /* ----- FILTER ----- */
    app.get('/filterOptions', (req, res) => filterOptionsHandler(req, res, propertyRepository));
    /* ----- FILTER END ----- */

    /* ----- AUTH ----- */
    app.post('/auth/sign_up', (req, res) => signUpHandler(req, res, userRepository));

    app.post('/auth/sign_in', (req, res) => signInHandler(req, res, userRepository));

    app.post('/auth/check_token', (req, res) => checkTokenHandler(req, res, userRepository));
    /* ----- AUTH END ----- */

    const port = process.env.PORT || 8080;
    app.listen(port, function() {
        console.log(`App is listening on port ${port}`);   
    });
}).catch(error => console.log(error));