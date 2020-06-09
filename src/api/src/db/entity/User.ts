import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export default class User {

    constructor (email: string, password: string, firstName: string, lastName: string) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column("text")
    email: string;

    @Column("text")
    password: string;

    @Column("text")
    firstName: string;

    @Column("text")
    lastName: string;
}