import { Component, Input, OnInit } from '@angular/core';
import { ScheduledItem } from 'src/app/models/Monday';

@Component({
  selector: 'app-kanban-board-item',
  templateUrl: './kanban-board-item.component.html',
  styleUrls: ['./kanban-board-item.component.scss']
})
export class KanbanBoardItemComponent implements OnInit {

  constructor() { }
  @Input() Item: ScheduledItem;
  
  ngOnInit(): void {
  }

}
