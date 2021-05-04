import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BoardItem, SubItem } from 'src/app/models/BoardItem';
import { ScheduledItem } from 'src/app/models/Monday';
import * as _ from 'underscore';
import { HomeComponent } from '../home.component';


@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss']
})
export class KanbanBoardComponent implements OnInit {

  constructor(public parent: HomeComponent) { }

  @Input() Items$: Observable<ScheduledItem[]> = of([]);
  @Input() SubItems$: Observable<SubItem[]> = of([]);
  @Input() Status: string;
  @Input() primaryColor;

  ngOnInit(): void {
    
  }


}
