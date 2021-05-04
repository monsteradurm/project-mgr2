import { Component, HostBinding, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { BehaviorSubject, combineLatest, EMPTY, of } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { SubItem } from 'src/app/models/BoardItem';
import { ScheduledItem } from 'src/app/models/Monday';
import { KanbanBoardComponent } from '../kanban-board/kanban-board.component';
import * as _ from 'underscore';
import { SyncItemComponent } from '../../syncsketch/sync-item/sync-item.component';

@Component({
  selector: 'app-kanban-board-item',
  templateUrl: './kanban-board-item.component.html',
  styleUrls: ['./kanban-board-item.component.scss']
})
export class KanbanBoardItemComponent implements OnInit {
  contextMenuTop;
  contextMenuLeft;
  @ViewChild(MatMenu, {static:false}) contextMenu:MatMenu;
  @ViewChild(MatMenuTrigger, {static:false}) contextMenuTrigger: MatMenuTrigger;

  @ViewChild(SyncItemComponent, {static:false}) SyncItemComp: SyncItemComponent;
  Hovering = false;
  HasContext = false;
  @HostBinding('style.opacity') get opacity() {
    return this.SyncItemComp ? 1: 0.5;
  }

  @HostListener('mouseover', ['$event']) onMouseOver(evt) {
    if (this.SyncItemComp)
      this.Hovering = true;
  }
  @HostListener('mouseout', ['$event']) onMouseLeave(evt) {
    if (!this.HasContext)
      this.Hovering = false;
  }
  @HostListener('contextmenu', ['$event']) onContextMenu(evt) {
    this.contextMenuLeft = evt.x;
    this.contextMenuTop = evt.y - 105;
    this.contextMenuTrigger.toggleMenu()
    this.HasContext = true;
    event.preventDefault();
  }
  @HostListener('click', ['$event']) onClick(evt) {
    console.log(this.SyncItemComp)
    if (!this.SyncItemComp)
      return;

    this.SyncItemComp.onClick();
  }
  constructor(private parent: KanbanBoardComponent) { }

  private item = new BehaviorSubject<ScheduledItem>(null);
  Item$ = this.item.asObservable().pipe(shareReplay());

  BoardId$ = this.Item$.pipe(
    map(item => item ? item.board.id : EMPTY)
  )

  Boards$ = this.parent.parent.Boards$;

  Board$ = combineLatest([this.BoardId$, this.Boards$]).pipe(
    map(([id, boards]) => {
      if (!id || !boards)
        return null;

      return _.find(boards, b => b.id == id);
    }))

  _Item;
  @Input() set Item(s: ScheduledItem) {
    this._Item = s;
    this.item.next(s);
  }

  get Item() { return this._Item; }

  Columns$ = this.Board$.pipe(
    map(board => board.columns)
  );

  StatusOptions$ = this.Columns$.pipe(
    map(columns => _.find(columns, c => c.title == "Status")),
    map(status => {
      let settings = JSON.parse(status.settings_str)
      let indices = Object.keys(settings.labels);
      let result = [];
      indices.forEach(i => {
        let option = settings.labels_colors[i];
        option.index = i;
        option.column_id = status.id;
        option.label = settings.labels[i];
        result.push(option);
      });
      return _.sortBy(result, r => r.label);
    }),
    shareReplay(1)
  )
  
  onContextClosed() {
    this.HasContext = false;
    this.Hovering = false;
  }

  get projectService() { return this.parent.parent.projectService; }

  onSetStatus(column) {
    this.projectService.SetItemStatus(this.Item.board.id, this.Item, column);

    this.Item.status['additional_info']['color'] = column.color;
    this.Item.status['additional_info']['label'] = column.label;
    this.Item.status['text'] = column.label;
    this.Item = JSON.parse(JSON.stringify(this.Item));
  }

  @Input() SubItem: SubItem;

  ngOnInit(): void {
  }

}
