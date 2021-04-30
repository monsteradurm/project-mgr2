import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { BoardItem, SubItem } from '../../../../models/BoardItem';
import { ProjectComponent } from '../../project/project.component';
import { OverviewComponent } from '../overview.component';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';

import * as _ from 'underscore';
import { map, switchMap, take } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

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
    this.parent.onSelectItem(this.boarditem)
  }

  @Output()
  @ViewChild('outplug', {static: false, read: ElementRef}) plug: ElementRef;
  constructor(public parent: OverviewComponent,
              private project: ProjectComponent) { }

  @Output() Hovering: boolean = false;
  HasContext = false;
  @Input() boarditem: BoardItem;
  @Output() itemClicked = new EventEmitter<boolean>(null);
  @Output() onExpand = new EventEmitter<boolean>(null);
  @Output() CaptionVisible: boolean = true;
  @Output() ItemCodeVisible: boolean = true;

  @Input() set Width(W: number) {
      this.CaptionVisible = W > 750;
      this.ItemCodeVisible = W > 650;
  }

  onSetStatus(s) {
    let label = s.label;
    if (
        (!this.boarditem.status && label == "Not Started") || 
        (this.boarditem.status && (!this.boarditem.status.text && label == "Not Started")) || 
        (this.boarditem.status && (label == this.boarditem.status.text))
     ) {
      this.parent.parent.messenger.add({
        severity: 'info',
        summary: 'Status is already "' + label + '"',
        life: 3000,
        detail: this.boarditem.name
      });
      return;
    } else {
    this.parent.Board$.pipe(
      map(board => board.id),
      switchMap(board_id => 
      this.parent.parent.monday.SetBoardItemStatus$(board_id, this.boarditem.id.toString(), s.column_id, s.index))
      ).pipe(
        take(1)
      ).subscribe((result:any) => {
        if (result && result.change_simple_column_value && result.change_simple_column_value.id) {
            this.parent.parent.messenger.add(
              { severity:'success',
                summary: 'Status Updated',
                life: 3000,
                detail: this.boarditem.name
            });

            this.parent.parent.socket.SendBoardItemUpdate(
              this.boarditem.board.id, this.boarditem.group.id, this.boarditem.id
            );

        } else {
          this.parent.parent.messenger.add(
            {
              severity:'error',
              summary: 'Error Updating Status',
              life: 3000,
              detail: this.boarditem.name
            }
          )
        }
      })
    }
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
