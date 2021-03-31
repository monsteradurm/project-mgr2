import { ColumnType, ColumnValues } from "./Columns";
import * as _ from 'underscore';

export class BoardItem {
    id: number;
    name: string;
    task: string;
    element: string;
    department: ColumnValues[];
    artist: ColumnValues[];
    director: ColumnValues[];
    timeline: ColumnValues[];
    timetracking: ColumnValues[];
    status: ColumnValues;
    itemcode: ColumnValues;
    subitems: SubItem[];
    subitem_ids: string[];
    isExpanded: boolean = false;
 
    dependencies: ColumnValues[];
    get description() {
        return this.updates && this.updates.length > 0 ?
            this.updates[0] : null;      
    }
    updates: {
        id: string;
        body: string //html
        creator: { id: string };
        created_at: Date;
    }[]; //limited to [].length 1

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

    constructor(i: any) {
        this.id = i.id;
        this.name = i.name;
        let arr = i.name.split('/');
        this.task = arr[arr.length - 1];
        this.element = arr[arr.length - 2];

        this.validate(i.column_values);

        this.department = ColumnValues.ParseDistinct(i.column_values, ColumnType.Department);
        this.artist = ColumnValues.ParseDistinct(i.column_values, ColumnType.Artist);
        this.director = ColumnValues.ParseDistinct(i.column_values, ColumnType.Director);
        this.timeline = ColumnValues.ParseFirst(i.column_values, ColumnType.Timeline);
        this.timetracking = ColumnValues.ParseFirst(i.column_values, ColumnType.TimeTracking);
        
        this.status = ColumnValues.ParseFirst(i.column_values, ColumnType.Status);
        this.itemcode = ColumnValues.ParseFirst(i.column_values, ColumnType.ItemCode);
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

export class SubItem {
    id: number;
    name: string;
    element: string;
    task: string;
    artist: ColumnValues[];
    timetracking: ColumnValues[];
    timeline: ColumnValues[];
    updates: {
        id: string;
        body: string //html
        creator: { id: string };
        created_at: Date;
    }[]; //limited to [].length 1
    constructor(i:any) {
        this.id = i.id;
        this.name = i.name;
        this.task = i.name; // duplicated for gantt chart processing
        this.artist = ColumnValues.ParseDistinct(i.column_values, ColumnType.Artist);
        this.timeline = ColumnValues.ParseFirst(i.column_values, ColumnType.Timeline);
        this.timetracking = ColumnValues.ParseFirst(i.column_values, ColumnType.TimeTracking);
        this.updates = i.updates;
    }
}