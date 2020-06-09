import { observable } from "mobx";

let dtFrom = new Date().toISOString().split('T')[0];
let nextDt = new Date();
nextDt.setDate(new Date(dtFrom).getDate() + 1);
let dtTo = nextDt.toISOString().split('T')[0];

export let filterDate = observable({
    from: dtFrom,
    to: dtTo
})