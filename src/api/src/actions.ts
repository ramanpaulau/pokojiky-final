import User from './db/entity/User';
import _ = require('lodash');
import fs = require('fs');

// bcrypt
import bcrypt = require('bcryptjs');
const saltRounds = 10;

// jwt
import jwt = require('jsonwebtoken');
import { Brackets } from "typeorm";
import Locality from "./db/entity/Locality";
import PropertyType from "./db/entity/PropertyType";
const jwtKey = "veryStrongjWtKeyForSeminarProject";

export async function signUpHandler(req, res, userRepository): Promise<User> {
    if (await userRepository.count({ email: req.body.email })) {
        return res.send('Tento email je již použitý!');
    }
    
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
            if (err) {
                console.log(err);
                return;
            }

            const user = new User(req.body.email, hash, req.body.firstName, req.body.lastName);
            userRepository.insert(user);
        });
    });
    return res.send('Uživatel zaregistrován!');
}

export function registerUser(email, password, firstName, lastName, userRepository): void {
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            if (err) {
                console.log(err);
                return;
            }

            const user = new User(email, hash, firstName, lastName);
            userRepository.insert(user);
        });
    });
}

export async function signInHandler(req, res, userRepository): Promise<{ message: string; token: string }> {
    const { email, password } = req.body;

    const user = await userRepository.findOne({email: email});
    if (!user) {
        return res.send({ message: "Uživatel nenalezen.", token: null});
    }

    if (!bcrypt.compareSync(password, user.password)) {
        return res.send({ message: "Chybné heslo.", token: null});
    }

    const token = jwt.sign(
        { 
            id: user.id, 
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        }, jwtKey, {
        algorithm: "HS256",
    });

    return res.send({ message: "Úspěšné přihlášení.", token: token});
}

export async function checkTokenHandler(req, res, userRepository): Promise<{ user: User; message: string }> {
    const token = req.body.token;

    if (!token) {
        return res.send({ user: null, message: 'Bad request!' });
    }

    let payload;
    try {
        payload = jwt.verify(token, jwtKey);
    } catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
            return res.send({ user: null, message: 'Error occurred!', error: e });
        }
        return res.send({ user: null, message: 'Bad request!' });
    }
    
    if (!await userRepository.findOne({ where: {id: payload.id} }))
        return res.send({ user: null, message: 'User not found.' });
    return res.send({ user: payload, message: 'Success!' });
}

export async function uploadImageHandler(req, res, imageRepository): Promise<void> {
    const targetPath = 'property-' + req.params.id + '/';
    const result = await imageRepository
        .findOne({ where: { productID: req.params.id }, order: { path: "DESC" }, take: 1 });
     
    let fileCount = (!result) ? 0 : +result.path.slice(result.path.lastIndexOf('-') + 1, result.path.indexOf('.')) + 1;
    try {
        if(!req.files) {
            res.send('No file uploaded');
        } else {
            
            if (!Array.isArray(req.files.photos)) {
                const photo = req.files.photos;
                const ext = photo.name.slice(photo.name.lastIndexOf('.') + 1);
                const newName = targetPath + req.params.id + '-' + fileCount + '.' + ext;
                photo.mv('./images/' + newName);
                imageRepository.save({ productID: req.params.id, path: newName });
            } else {
                _.forEach(_.keysIn(req.files.photos), (key) => {
                    const photo = req.files.photos[key];
                    const ext = photo.name.slice(photo.name.lastIndexOf('.') + 1);
                    const newName = targetPath + req.params.id + '-' + fileCount + '.' + ext;
                    photo.mv('./images/' + newName);
                    imageRepository.save({ productID: req.params.id, path: newName });
                    fileCount++;
                });
        
                res.send('Files are uploaded');
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
    res.send();
}

export function removeImageHandler(req, res, imageRepository): void {
    req.body.files.forEach((file) => {
        const targetPath = './images/' + file;
        fs.unlink(targetPath , (err) => {
            if (err) throw err;
        });
        imageRepository.delete(file);
    });
    res.end();
}

export async function filteredPropertiesHandler(req, res, propertyRepository, reservationRepository): Promise<void> {
    const filter = req.body.filter;
    const date = req.body.date;
    const sort = req.body.sort;

    const takenIds = (await reservationRepository.createQueryBuilder("r")
        .select("r.propertyID", "id")
        .where("r.canceled = false")
        .andWhere(new Brackets(qb => {
            qb.where(":from > r.dtStart AND :from < r.dtEnd OR :to > r.dtStart AND :to < r.dtEnd", { from: date.from, to: date.to})
            .orWhere("r.dtStart >= :from AND r.dtEnd <= :to", { from: date.from, to: date.to})
        }))
        .getRawMany()).map(i => Number(i.id));

    let query = propertyRepository.createQueryBuilder("p")
        .leftJoinAndSelect(Locality, "l", "p.localityID = l.id")
        .leftJoinAndSelect(PropertyType, "t", "p.typeID = t.id")
        .where("p.disabled = false");

    if (filter.type >= 0) {
        query = query
        .andWhere("p.typeID = :typeID", { typeID: filter.type });
    }
    if (filter.locality >= 0) {
        query = query
        .andWhere("p.localityID = :localityID", { localityID: filter.locality });
    }
    if (filter.price >= 0) {
        query = query
        .andWhere("p.price <= :price", { price: filter.price });
    }
    if (filter.capacity >= 0) {
        query = query
        .andWhere("p.capacity = :capacity", { capacity: filter.capacity });
    }
    
    let properties;
    switch (sort) {
        case 0: properties = await query.orderBy("p.created", "ASC").getRawMany(); break;
        case 1: properties = await query.orderBy("p.created", "DESC").getRawMany(); break;
        case 2: properties = await query.orderBy("p.price", "ASC").getRawMany(); break;
        case 3: properties = await query.orderBy("p.price", "DESC").getRawMany(); break;
        case 4: properties = await query.orderBy("p.capacity", "ASC").getRawMany(); break;
        case 5: properties = await query.orderBy("p.capacity", "DESC").getRawMany(); break;
        default: properties = await query.getRawMany(); break;
    }

    res.send(properties.filter(i => takenIds.indexOf(i.p_id) < 0));
}

export async function filterOptionsHandler(req, res, propertyRepository): Promise<void> {
    const properties = await propertyRepository.createQueryBuilder("p")
        .leftJoinAndSelect(Locality, "l", "p.localityID = l.id")
        .leftJoinAndSelect(PropertyType, "t", "p.typeID = t.id")
        .where("p.disabled = false")
        .orderBy("p.created", "DESC")
        .getRawMany();
    const filterOptions = { types: [], localities: [], capacities: [], price: { min: 0, max: 0 }};

    // types
    const types: Record<string, number> = {};
    properties.forEach((p) => {
      if (!types[p.t_name]) {
        types[p.t_name] = p.t_id;
      }
    });
    filterOptions.types = Object.keys(types).map((i) => ({ name: String(i), id: types[i] }));

    // localities
    const localities: Record<string, number> = {};
    properties.forEach((p) => {
      if (!localities[p.l_name]) {
        localities[p.l_name] = p.l_id;
      }
    });
    filterOptions.localities = Object.keys(localities).map((i) => ({ name: i, id: localities[i] }));

    // capacities
    filterOptions.capacities = properties
        .map((i) => i.p_capacity)
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort((a, b) => {
            if (+a > +b) return 1;
            if (+b > +a) return -1;
            return 0;
        })
        .map((i) => ({ name: String(i), id: i }));
    
    // price
    let min: number = Number.MAX_VALUE;
    let max: number = Number.MIN_VALUE;
    properties.forEach((p) => {
      if (p.p_price > max) {
        max = Number(p.p_price);
      } else if (p.p_price < min) {
        min = Number(p.p_price);
      }
    });
    filterOptions.price = { min: min, max: max };

    res.send(filterOptions);
}