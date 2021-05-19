import * as moment from "moment";
import * as _ from 'underscore';

export class TimeEntry {
    id: string;
    user: string;
    date: string;
    duration: number;
    item: string;
    editing: boolean=false;
    isNew:boolean = false;

    object() {
        return { user: this.user, date: this.date, duration: this.duration, item: this.item, type: 'TimeEntry' }
    }

    static parse(id, stringified) {
        let result = new TimeEntry();

        result.id = id;
        Object.assign(result, JSON.parse(stringified));
        return result;
    }

    constructor(date?) {
        if (date)
          this.date = date;
    }
}
