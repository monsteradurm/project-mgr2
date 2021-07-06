import { trigger } from "@angular/animations";
import { AngularFirestore } from "@angular/fire/firestore";
import * as moment from "moment";
import { environment } from "src/environments/environment";

export class FirebaseUpdate {
    private static format: string = 'LLLL'
    updated: string;
    json: string;

    constructor(entry?: Partial<FirebaseUpdate>) {
        if (entry) {
        this.updated = entry.updated;
        this.json = entry.json;
        }
    }
    
    get moment() : moment.Moment{
        return moment(this.updated, 'LLLL');
    }

    asArray() {
        return JSON.parse(this.json) as any[];
    }

    asType<T>() {
        return JSON.parse(this.json) as T;
    }

    static create(from: any) {
        let result = new FirebaseUpdate();
        result.updated = moment().format('LLLL');
        result.json = JSON.stringify(from);
        return result;
    }

    hasExpired() {
        if (!this.updated || this.updated.length < 1)
            return true;
        
        else if (!this.json || this.json.length < 1)
            return true;

        let now = moment();
        console.log("Last Cached" + now.diff(this.moment, 'minutes') + " Minutes ago...");
        console.log("Caching every " + environment.cache.minutes + " Minutes");
        return now.diff(this.moment, 'minutes') > environment.cache.minutes;
    }
}