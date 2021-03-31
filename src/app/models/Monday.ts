import * as _ from 'underscore';

export class MondayIdentity {
    id: number;
    name: string;
    email: string;
    status: string;
    title: string;
    teams: string[];

    constructor(i: any) {
        this.id = i.id;
        this.name = i.name;
        this.email = i.email;
        this.title = i.title;
        this.teams = i.teams ? _.map(i.teams, t => t.name) : [];
        if (i.is_pending)
            this.status = "pending";
        else if (i.is_admin)
            this.status = "admin";
        else if (i.is_view_only)
            this.status = "view_only";
        else if (i.is_guest)
            this.status = "guest";
        else 
            this.status = "error!";
    }
}

export class Column {
    id: string;
    type: string;;
    title: string;
    constructor(i : any) {
        this.id = i.id;
        this.type = i.type;
        this.title = i.title;
    }
}