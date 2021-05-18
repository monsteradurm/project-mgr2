import { ItemStatus } from "./Calendar";
import { Tag } from "./Columns";
import * as moment from 'moment';
import * as _ from 'underscore';

export class Issue {
    id: string;
    name: string;
    workspace: { id: string, name: string };
    board: { id: string, name: string };
    group: { id: string, title: string };
    department: string;
    status: IssueStatus;
    updated_at: moment.Moment;
    issuer: { id: string, name: string };
    support: { id: string, name: string }[];
    updates: IssueUpdate[]
    get description() {
        return this.updates.length > 0 ? this.updates[0].body : null;
    }

    static parseDepartment(vals:any[]) {
        let col = this.parseColumn(vals, 'Department');
        return col.text;
    }
    static parseStatus(vals:any[]) {
        let col = this.parseColumn(vals, 'Status');

        return new IssueStatus(col.additional_info ? col.additional_info : null);
    }

    static parseUsers(vals:any[], title:'Issuer' | 'Support') {
        let col = this.parseColumn(vals, title);
        if (!col.value)
            return [];

        let ids = _.map(col.value.personAndTeams, t => t.id);
        let names = col.text.split(', ');
        let zipped = _.zip(ids, names);

        let persons = _.map(zipped, z => ({id: z[0], name: z[1]}));
        if (title == 'Issuer') return persons[0];

        return persons;
    }

    static parseColumn(vals:any[], title:string) :any {
        let col = _.find(vals, c => c.title == title)
        if (col.additional_info)
            col.additional_info = JSON.parse(col.additional_info);
        if (col.value)
            col.value = JSON.parse(col.value);
        return col;
    }

    static parse(obj: any) {
        let i = new Issue();
        i.board = { id: obj.board.id, name: obj.board.name };
        i.workspace = { id: obj.board.workspace.id, name: obj.board.workspace.name };
        i.group = { id: obj.group.id, title: obj.group.title };
        i.id = obj.id;
        i.name = obj.name;
        i.updated_at = moment(obj.updated_at)
        i.department = this.parseDepartment(obj.column_values);
        i.status = this.parseStatus(obj.column_values);
        i.support = this.parseUsers(obj.column_values, 'Support');
        i.issuer = this.parseUsers(obj.column_values, 'Issuer');
        i.updates = obj.updates;
        return i;
    }
    constructor() {

    }
}
export class IssueReply {
    updated_at: moment.Moment;
    body: string;
    id: string;

    constructor() { }
}
export class IssueUpdate extends IssueReply {
    replies: IssueReply[]

    constructor() {
        super();
    }
}

export class IssueStatus {
    text: string;
    color: string;

    static GetText(i) {
        if (i && i.label)
            return i.label;
        return 'New Issue';
    }

    static GetColor(i) {
        if(i && i.label == "New Issue")
            return '#000'
            
        if (i && i.color)
            return i.color;
        return '#000'
    }

    constructor(i?: any) {
        this.text = IssueStatus.GetText(i);
        this.color = IssueStatus.GetColor(i);
    }
}