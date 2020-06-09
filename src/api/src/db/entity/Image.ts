import {Entity, PrimaryColumn, Column} from "typeorm";

@Entity()
export default class Image {

    constructor (path: string, id: number) {
        this.path = path;
        this.productID = id;
    }

    @PrimaryColumn("text")
    path: string;

    @Column("numeric")
    productID: number;
}