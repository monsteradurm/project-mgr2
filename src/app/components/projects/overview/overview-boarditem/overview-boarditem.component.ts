import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { BoardItem, SubItem } from '../../../../models/BoardItem';
import { ProjectComponent } from '../../project/project.component';
import { OverviewComponent } from '../overview.component';

import * as _ from 'underscore';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-overview-boarditem',
  templateUrl: './overview-boarditem.component.html',
  styleUrls: ['./overview-boarditem.component.scss']
})
export class OverviewBoarditemComponent implements OnInit {
  onSelect() {
    this.parent.onSelectItem(this.boarditem)
  }

  @Output()
  @ViewChild('outplug', {static: false, read: ElementRef}) plug: ElementRef;
  constructor(public parent: OverviewComponent,
              private project: ProjectComponent) { }

  @Input() boarditem: BoardItem;
  @Output() itemClicked = new EventEmitter<boolean>(null);
  @Output() onExpand = new EventEmitter<boolean>(null);
  @Output() CaptionVisible: boolean = true;
  @Output() ItemCodeVisible: boolean = true;

  @Input() set Width(W: number) {
      this.CaptionVisible = W > 750;
      this.ItemCodeVisible = W > 650;
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
