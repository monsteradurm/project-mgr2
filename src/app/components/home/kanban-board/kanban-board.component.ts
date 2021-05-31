import { ChangeDetectionStrategy, Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BoardItem, SubItem } from 'src/app/models/BoardItem';
import { ScheduledItem } from 'src/app/models/Monday';
import * as _ from 'underscore';
import { HomeComponent } from '../home.component';
import { KanbanBoardItemComponent } from '../kanban-board-item/kanban-board-item.component';


@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./kanban-board.component.scss']
})
export class KanbanBoardComponent implements OnInit {
  @HostListener('contextmenu', ['$event']) onContextMenu(event) {

    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';

    this.StatusOptions$ = this.ComponentContext.StatusOptions$;

    this.contextMenuTrigger.toggleMenu()
    this.ComponentContext.HasContext = true;
    event.preventDefault();
  }

  contextMenuPosition = { x: '0px', y: '0px' };
  @ViewChild(MatMenu, {static:false}) contextMenu:MatMenu;
  @ViewChild(MatMenuTrigger, {static:false}) contextMenuTrigger: MatMenuTrigger;

  constructor(public parent: HomeComponent) { }

  @Input() Items$: Observable<ScheduledItem[]> = of([]);
  @Input() SubItems$: Observable<SubItem[]> = of([]);
  @Input() Status: string;
  @Input() primaryColor;

  StatusOptions$;

  onSetStatus(column) {
    this.ComponentContext.onSetStatus(column);
  }

  ngOnInit(): void {
    
  }

  ComponentContext: KanbanBoardItemComponent;
    
  onContextClosed() {
    this.ComponentContext.HasContext = false;
    this.ComponentContext.Hovering = false;
  }

}
