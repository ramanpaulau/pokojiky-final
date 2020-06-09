import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export default class Reservation {

    constructor (dtStart: Date, dtEnd: Date, propertyID: number, customerID: number, totalPrice: number, score?: number) {
        this.dtStart = dtStart;
        this.dtEnd = dtEnd;
        this.propertyID = propertyID;
        this.customerID = customerID;
        this.totalPrice = totalPrice;
        this.score = (score) ? score : -1;
        this.canceled = false;
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column("date")
    dtStart: Date;

    @Column("date")
    dtEnd: Date;

    @Column("numeric")
    propertyID: number;

    @Column("numeric")
    customerID: number;

    @Column("numeric")
    totalPrice: number;

    @Column("boolean")
    canceled: boolean;
    
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    created: string;

    @Column({ type: "numeric", default: -1})
    score: number; // 0 ... 5
}