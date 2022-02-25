import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { BoardItem, SubItem } from '../../../../models/BoardItem';
import { ProjectComponent } from '../../project/project.component';
import { OverviewComponent } from '../overview.component';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';

import * as _ from 'underscore';
import { map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { Column } from 'src/app/models/Monday';
import { ColumnValues } from 'src/app/models/Columns';

@Component({
  selector: 'app-overview-boarditem',
  templateUrl: './overview-boarditem.component.html',
  styleUrls: ['./overview-boarditem.component.scss']
})
export class OverviewBoarditemComponent implements OnInit {

  contextMenuTop;
  contextMenuLeft;
  @ViewChild(MatMenu, {static:false}) contextMenu:MatMenu;
  @ViewChild(MatMenuTrigger, {static:false}) contextMenuTrigger: MatMenuTrigger;

  @HostListener('mouseover', ['$event']) onMouseOver(evt) {
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

  StatusOptions$ = this.parent.parent.StatusOptions$;

  onContextClosed() {
    this.HasContext = false;
    this.Hovering = false;
  }

  onSelect() {
    this.BoardItem$.pipe(take(1)).subscribe((boarditem:BoardItem) => {
      this.parent.onSelectItem(boarditem)
    })
    
  }

  @Output()
  @ViewChild('outplug', {static: false, read: ElementRef}) plug: ElementRef;
  constructor(public parent: OverviewComponent,
              private ref: ChangeDetectorRef,
              private project: ProjectComponent) { }

  @Output() Hovering: boolean = false;
  HasContext = false;
  @Input() set boarditem(b: BoardItem) {
    this.BoardItem.next(b);
    this.ref.detectChanges();
  }
  BadgeOptions$ = this.parent.BadgeOptions$;

  @Output() itemClicked = new EventEmitter<boolean>(null);
  @Output() onExpand = new EventEmitter<boolean>(null);
  @Output() CaptionVisible: boolean = true;
  @Output() ItemCodeVisible: boolean = true;

  BoardItem = new BehaviorSubject<BoardItem>(null);
  BoardItem$ = this.BoardItem.asObservable();


  @Input() set Width(W: number) {
      this.CaptionVisible = W > 750;
      this.ItemCodeVisible = W > 650;
  }

  onHoursDlg() {
    this.BoardItem$.pipe(take(1)).subscribe((boarditem) => {
      this.parent.onHoursDlg(boarditem);
    })
    
  }

  onSetBadge(column) {
    this.BoardItem$.pipe(take(1)).subscribe((boarditem) => {
      this.parent.parent.firebase.AddBadge(boarditem, column).pipe(take(1)).subscribe((result) => {})
    })
  }

  onRemoveBadge(badge) {
    this.BoardItem$.pipe(take(1)).subscribe((boarditem) => {
      this.parent.parent.firebase.RemoveBadge(boarditem, badge).pipe(take(1)).subscribe((result) => {})
    })
  }
  onSetStatus(column) {
    this.BoardItem$.pipe(take(1)).subscribe((boarditem) => {
      let old = JSON.parse(JSON.stringify(boarditem));
      if (!boarditem['status'])
        boarditem['status'] = new ColumnValues(null);
      boarditem.status.text = column.label;
      boarditem.status.additional_info['color'] = column.color;
      boarditem.status.additional_info['label'] = column.label;
      this.boarditem = boarditem;
      
      this.parent.parent.projectService.SetItemStatus(old.board.id, old, column).pipe(take(1))
        .subscribe(
          (result:boolean) => {
            if (!result) {
              this.BoardItem.next(old);
            }
          }
        )
    })
    
  }


  onClick(i) {
    this.itemClicked.next(i);
  }

  OnExpandButton(i) {
    i.isExpanded = !i.isExpanded;
    this.onExpand.next(true);
  }

  ngOnInit(): void {
  }

}
