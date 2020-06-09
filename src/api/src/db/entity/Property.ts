import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export default class Property {

    constructor (localityID: number, price: number, ownerID: number, capacity: number, typeID: number, name: string, description: string) {
        this.localityID = localityID;
        this.price = price;
        this.ownerID = ownerID;
        this.capacity = capacity;
        this.typeID = typeID;
        this.name = name;
        this.description = description;
        this.disabled = false;
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column("numeric")
    localityID: number;

    @Column("numeric")
    price: number;

    @Column("numeric")
    ownerID: number;

    @Column("numeric")
    capacity: number;

    @Column("numeric")
    typeID: number;

    @Column("text")
    name: string;

    @Column("text")
    description: string;

    @Column("boolean")
    disabled: boolean;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    created: string;
}