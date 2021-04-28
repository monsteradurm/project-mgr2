export class BoardItemUpdate {
    board_id: string;
    group_id: string;
    item_id: string;
    user_id: string;

    constructor(u: any) {
        this.board_id = u.board_id;
        this.group_id = u.group_id;
        this.item_id = u.item_id;
        this.user_id = u.user_id;
    }
}

export class BoardUpdate {
    board_id: string;
    group_id: string;
    user_id: string;

    constructor(u: any) {
        this.board_id = u.board_id;
        this.group_id = u.group_id;
        this.user_id = u.user_id;
    }
}