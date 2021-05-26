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
        this.email = i.email.toLowerCase();
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
    artist: ColumnValues[];
    director: ColumnValues[];
    status: ColumnValues;
    caption: ColumnValues;
    timeline: ColumnValues;
    department: ColumnValues;
    department_text: string[];
    itemcode: ColumnValues;
    subitems: SubItem[];
    subitem_ids: string[];
    due: ColumnValues;
    expected_days: ColumnValues;
    task:string;
    element:string;

    selection: string; 
    column_values: any;
    column_ids: any = {};

    is_milestone() : boolean {
        return this.timeline && this.timeline.value && this.timeline.value.visualization_type == 'milestone';
    }

    constructor(i:any) {
        this.id = i.id;
        this.name = i.name;
        let arr = i.name.split('/');
        this.task = arr[arr.length - 1];
        this.element = arr[arr.length - 2];

        this.board = { id: i.board.id, name: i.board.name };
        this.group = { id: i.group.id, title: i.group.title };
        this.selection = this.group.title + ', ' + this.name;
        this.workspace = { id: i.board.workspace.id, name: i.board.workspace.name};

        this.column_ids[ColumnType.Department] = ColumnValues.FindColumnId(i.column_values, ColumnType.Department)
        this.department = ColumnValues.ParseDistinct(i.column_values, ColumnType.Department);
        this.department_text = _.map(this.department, d=> d.text);
        this.column_ids[ColumnType.Artist] = ColumnValues.FindColumnId(i.column_values, ColumnType.Artist)
        this.artist = ColumnValues.ParseDistinct(i.column_values, ColumnType.Artist);

        this.column_ids[ColumnType.Director] = ColumnValues.FindColumnId(i.column_values, ColumnType.Director)
        this.director = ColumnValues.ParseDistinct(i.column_values, ColumnType.Director);

        this.column_ids[ColumnType.Timeline] = ColumnValues.FindColumnId(i.column_values, ColumnType.Timeline)
        this.timeline = ColumnValues.ParseFirst(i.column_values, ColumnType.Timeline);

        this.column_ids[ColumnType.TimeTracking] = ColumnValues.FindColumnId(i.column_values, ColumnType.TimeTracking)
        this.caption = ColumnValues.ParseFirst(i.column_values, ColumnType.Caption);

        this.column_ids[ColumnType.Status] = ColumnValues.FindColumnId(i.column_values, ColumnType.Status)
        this.status = ColumnValues.ParseFirst(i.column_values, ColumnType.Status);

        this.column_ids[ColumnType.ItemCode] = ColumnValues.FindColumnId(i.column_values, ColumnType.ItemCode)
        this.itemcode = ColumnValues.ParseFirst(i.column_values, ColumnType.ItemCode);

        this.column_ids[ColumnType.Due] = ColumnValues.FindColumnId(i.column_values, ColumnType.Due)
        this.due = ColumnValues.ParseFirst(i.column_values, ColumnType.Due);

        this.column_ids[ColumnType.ExpectedDays] = ColumnValues.FindColumnId(i.column_values, ColumnType.ExpectedDays)
        this.expected_days = ColumnValues.ParseFirst(i.column_values, ColumnType.ExpectedDays);

        this.subitems = null;

        this.column_values = i.column_values;

        this.column_ids[ColumnType.SubItems] = ColumnValues.FindColumnId(i.column_values, ColumnType.SubItems)
        let subitems = ColumnValues.ParseFirst(i.column_values, ColumnType.SubItems);

        if (!subitems) {
            this.subitem_ids = [];
            return;
        }

        this.subitem_ids = _.map(subitems.value.linkedPulseIds, i => i.linkedPulseId);
    }

} 