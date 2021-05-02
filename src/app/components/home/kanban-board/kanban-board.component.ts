import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BoardItem } from 'src/app/models/BoardItem';
import { ScheduledItem } from 'src/app/models/Monday';
import * as _ from 'underscore';


@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss']
})
export class KanbanBoardComponent implements OnInit {

  constructor() { }

  @Input() Items$: Observable<ScheduledItem[]> = of([]);
  @Input() primaryColor;

  Workspaces$: Observable<any[]>;
  Boards$: Observable<any[]>;
  Groups$: Observable<any[]>;

  ngOnInit(): void {
    this.Workspaces$ = this.Items$.pipe(
      map(items => items ? _.map(items, i => i.workspace) : []),
      map(ws => _.uniq(ws, w => w.id)),
    )

    this.Boards$ = this.Items$.pipe(
      map(items => items ? _.map(items, i => i.board) : []),
      map(boards => _.uniq(boards, b => b.id))
    )

    this.Groups$ = this.Items$.pipe(
      map(items => items ? _.map(items, i => i.group) : []),
      map(groups => _.uniq(groups, g => g.id))
    )
  }


}
