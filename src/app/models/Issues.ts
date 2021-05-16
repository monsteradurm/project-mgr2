import { ItemStatus } from "./Calendar";
import { Tag } from "./Columns";

export class Issue {
    id: string;
    workspace: {id: string, name: string};
    board: {id: string, name: string};
    group: {id: string, title: string};
    application: Tag;
    team: Tag;
    service: Tag;
    renderer: Tag;
    status: ItemStatus;
    issuer: {id: string, name: string};
    notify: {id: string, name: string}[];
}