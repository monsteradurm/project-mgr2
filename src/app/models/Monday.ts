import * as _ from 'underscore';
import { SubItem } from './BoardItem';
import { ColumnType, ColumnValues } from './Columns';

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

export class ScheduledItem {
    id: string;
    name: string;
    board: {
        id:string,
        name: string
    };
    group: {
        id: string,
        title: string
    };
    workspace: {
        id: string,
        name: string
    }
    artist: ColumnValues;
    timetracking: ColumnValues;
    director: ColumnValues;
    status: ColumnValues;
    timeline: ColumnValues;
    department: ColumnValues;
    itemcode: ColumnValues;
    subitems: SubItem[];
    subitem_ids: string[];

    constructor(i:any) {
        this.id = i.id;
        this.name = i.name;
        this.board = { id: i.board.id, name: i.board.name };
        this.group = { id: i.group.id, title: i.group.title };
        this.workspace = { id: i.board.workspace.id, name: i.board.workspace.name};
        this.department = ColumnValues.ParseDistinct(i.column_values, ColumnType.Department);
        this.artist = ColumnValues.ParseDistinct(i.column_values, ColumnType.Artist);
        this.director = ColumnValues.ParseDistinct(i.column_values, ColumnType.Director);
        this.timeline = ColumnValues.ParseFirst(i.column_values, ColumnType.Timeline);
        this.timetracking = ColumnValues.ParseFirst(i.column_values, ColumnType.TimeTracking);
        this.status = ColumnValues.ParseFirst(i.column_values, ColumnType.Status);
        this.itemcode = ColumnValues.ParseFirst(i.column_values, ColumnType.ItemCode);
        this.status = ColumnValues.ParseFirst(i.column_values, ColumnType.Status);
        this.itemcode = ColumnValues.ParseFirst(i.column_values, ColumnType.ItemCode);
        this.subitems = null;

        let subitems = ColumnValues.ParseFirst(i.column_values, ColumnType.SubItems);
        if (!subitems) {
            this.subitem_ids = [];
            return;
        }

        this.subitem_ids = _.map(subitems.value.linkedPulseIds, i => i.linkedPulseId);
    }

} 