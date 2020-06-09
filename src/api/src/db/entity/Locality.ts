import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export default class Locality {

    constructor(name: string) {
        this.name = name;
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column("text")
    name: string;
}