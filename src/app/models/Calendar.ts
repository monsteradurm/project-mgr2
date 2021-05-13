import { BoardItem } from "./BoardItem";
import { MondayIdentity, ScheduledItem } from "./Monday";
import * as _ from 'underscore';
import * as moment from 'moment';

import { TimeEntry } from "./TimeLog";

export class CalendarItem {
    extendedProps = new CalendarProperties('allocation')
    id: string;
    title: string;
    start: string;
    end: string;
    backgroundColor: string

    constructor(i: ScheduledItem) {
        let status = new ItemStatus(i);
        this.id = i.id;
        this.extendedProps.tooltipId = i.id;
        this.extendedProps.element = i.element;
        this.extendedProps.task = i.task;
        this.extendedProps.artist = _.map(i.artist, d => d.text).join(", ");
        this.extendedProps.users = _.map(i.artist, d => d.id);
        this.extendedProps.director = _.map(i.director, d => d.text).join(", ");
        this.extendedProps.department = i.department_text.join(', ');
        this.extendedProps.workspace = i.workspace.name;
        this.extendedProps.timeline = i.timeline.text;
        this.extendedProps.group = i.group.title;
        this.extendedProps.board = i.board.name;
        this.extendedProps.id  = i.id;
        this.title = `${i.name} (${status.text})`;

        if (i.itemcode && i.itemcode.text)
            this.title = i.itemcode.text + ', ' + this.title;

        if (i.subitem_ids.length > 0) {
            this.extendedProps.subitems = _.map(i.subitems, (sub) => ({id: sub.id, name: sub.name}))
        }

        this.start = i.timeline.value.from;
        this.end = i.timeline.value.to;
        this.backgroundColor = status.color;
    }
}

export class SubItemProperties {
    name: string;
    id: string;
    public constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
}

export class CalendarProperties {
    id: string | number;
    artist: string = null;
    director: string = null;
    department: string = null;
    tooltipId: number | string = null;
    workspace: string = null;
    element: string = null;
    task: string = null;
    board: string = null;
    group: string = null;
    timeline: string = null;
    type: string = null;
    subitems: SubItemProperties[] = [];
    status: ItemStatus = new ItemStatus();
    users: string[];
    logs: TimeEntry[] = [];
    constructor(type:string) {
        this.type = type;
    }
}
export class CalendarMilestone extends CalendarItem {
    display: string = 'background';
    classNames: string[] = ['milestone-item']
    constructor(i: ScheduledItem) {
        super(i);
        this.extendedProps.type = 'milestone';
        this.title = i.name;
    }
}

export class CalendarLog {
    extendedProps: {
        allocation: CalendarProperties
        users: string[];
        duration: number;
        type: string;
        tooltipId: number | string;
    } = {
        allocation: null,
        users: [],
        duration: null,
        tooltipId: null,
        type: 'time-log',
    }
    id: string;
    start: string;
    end: string;
    title: string;
    classNames: string[] = ['log-item'];
    constructor(entry: TimeEntry, allocation: CalendarProperties) {
        this.extendedProps.allocation = allocation;
        this.extendedProps.users = [entry.user];
        this.start = moment(entry.date).format('YYYY-MM-DD');
        this.end = this.start;
        this.extendedProps.duration = entry.duration;
        this.title = `Logged ${entry.duration} Hours`;
        this.id = entry.id;
    }
}

export class ItemStatus {
    text: string;
    color: string;

    static GetText(i) {
        if (i && i.status && i.status.text)
            return i.status.text;
        return 'Not Started';
    }

    static GetColor(i) {
        if (i && i.status && i.status.additional_info)
            return i.status.additional_info.color;
        return '#000'
    }

    constructor(i?: ScheduledItem | BoardItem) {
        this.text = ItemStatus.GetText(i);
        this.color = ItemStatus.GetColor(i);
    }
}