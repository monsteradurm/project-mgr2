export class GanttItem {
    id: string;
    artist: string;
    start: Date;
    end: Date;
    duration: number;
    dependencies: string;
    completed: number; //percent

    constructor() {
        
    }
}