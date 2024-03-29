import { ColumnType, ColumnValues } from "./Columns";
import * as _ from 'underscore';
import { Column, ScheduledItem } from "./Monday";

export class BoardItem {
    id: number;
    name: string;
    task: string;
    type: string = 'task';
    updated_at: string;
    element: string;
    group: { id: string, title: string }
    due: ColumnValues;
    expected_days: Column;
    department: ColumnValues[];
    department_text: string[];
    artist: ColumnValues[];
    director: ColumnValues[];
    timeline: ColumnValues;
    timetracking: ColumnValues[];
    status: ColumnValues;
    itemcode: ColumnValues;
    subitems: SubItem[];
    subitem_ids: string[];
    dependencies: ColumnValues[];

    isExpanded: boolean = false;
    board: {
        id:string,
        name: string
    };
    workspace: {
        id: string,
        name: string
    }

    selection: string;
    column_values: any;
    column_ids: any = {};
    description: ColumnValues;
    caption: ColumnValues;
    
    updates: {
        id: string;
        body: string //html
        creator: { id: string };
        created_at: Date;
    }[]; //limited to [].length 1

    is_milestone() : boolean {
        return this.timeline && this.timeline.value && this.timeline.value.visualization_type == 'milestone';
    }
    validate(col_values) {
        let errors = [];
        if (ColumnValues.FindColumn(col_values, ColumnType.Department, true).length < 1)
           errors.push('Department Columns are required and must have a value.')

        if (ColumnValues.FindColumn(col_values, ColumnType.Artist, false).length < 1)
           errors.push('Artist Columns are required.')

        if (ColumnValues.FindColumn(col_values, ColumnType.Director, false).length < 1)
           errors.push('Director Columns are required.')

        if (ColumnValues.FindColumn(col_values, ColumnType.Timeline, false).length < 1)
           errors.push('Timeline Columns are required.')

        if (ColumnValues.FindColumn(col_values, ColumnType.SubItems, false).length < 1)
           errors.push('SubItem Columns are required.')
        
        if (ColumnValues.FindColumn(col_values, ColumnType.ItemCode, false).length < 1)
           errors.push('ItemCode Columns are required.')

        if (errors.length > 0) {
            throw new Error(errors.join("\n"));
        }
    }

    constructor(i: any, w:any, g:any, b:any) {
        
        this.id = i.id;
        this.name = i.name;
        this.updated_at = i.updated_at;
        this.group = { id: g.id, title: g.title};
        this.board = { id: b.id, name: b.name };

        let arr = i.name.split('/');
        this.task = arr[arr.length - 1];
        this.element = arr[arr.length - 2];
        this.department = ColumnValues.ParseDistinct(i.column_values, ColumnType.Department);
        this.department_text = _.map(this.department, d => d.text);
        this.artist = ColumnValues.ParseDistinct(i.column_values, ColumnType.Artist);
        this.director = ColumnValues.ParseDistinct(i.column_values, ColumnType.Director);
        this.timeline = ColumnValues.ParseFirst(i.column_values, ColumnType.Timeline);
        this.timetracking = ColumnValues.ParseFirst(i.column_values, ColumnType.TimeTracking);
        this.caption = ColumnValues.ParseFirst(i.column_values, ColumnType.Caption);
        this.description = ColumnValues.ParseFirst(i.column_values, ColumnType.Description);
        this.status = ColumnValues.ParseFirst(i.column_values, ColumnType.Status);
        this.itemcode = ColumnValues.ParseFirst(i.column_values, ColumnType.ItemCode);
        this.due = ColumnValues.ParseFirst(i.column_values, ColumnType.Due);
        this.expected_days = ColumnValues.ParseFirst(i.column_values, ColumnType.ExpectedDays);
        this.selection = this.group.title + ', ' + this.name;

        if (this.selection.length > 50)
            this.selection = this.selection.substr(0, 50);
            
        this.workspace = { id: w.id, name: w.name};

        this.updates = i.updates;
        this.subitems = null;

        let subitems = ColumnValues.ParseFirst(i.column_values, ColumnType.SubItems);
        if (!subitems) {
            this.subitem_ids = [];
            return;
        }

        this.subitem_ids = _.map(subitems.value.linkedPulseIds, i => i.linkedPulseId);
    }
}
export class Workspace {
    id: number;
    name: string;

    constructor(w:{name:string, id:number}) {
        this.id = w.id;
        this.name = w.name;
    }
}

export class Board {
    id: number;
    name: string;
    workspace: { name: string, id: number};
    groups: { id: string, title: string}[];
    columns: any[];
    selection: string; // mat-select preview

    constructor(i: any) {
        this.id = i.id;
        this.name = i.name;
        this.columns = i.columns;
        this.workspace = {name: i.workspace.name, id: i.workspace.id};
        this.groups = _.map(i.groups, g => ({ id: g.id, title: g.title }));
        this.selection = this.workspace.name + ', ' + this.name
    }

}

export class SubItem {
    id: number;
    name: string;
    updated_at: string;
    element: string;
    task: string;
    artist: ColumnValues[];
    timetracking: ColumnValues[];
    timeline: ColumnValues[];
    parent: ScheduledItem | BoardItem;
    type: string = 'revision';
    updates: {
        id: string;
        body: string //html
        creator: { id: string };
        created_at: Date;
    }[]; //limited to [].length 1
    constructor(i:any) {
        this.id = i.id;
        this.updated_at = i.updated_at;
        this.name = i.name;
        this.task = i.name; // duplicated for gantt chart processing
        this.artist = ColumnValues.ParseDistinct(i.column_values, ColumnType.Artist);
        this.timeline = ColumnValues.ParseFirst(i.column_values, ColumnType.Timeline);
        this.timetracking = ColumnValues.ParseFirst(i.column_values, ColumnType.TimeTracking);
        this.updates = i.updates;

        
    }
}