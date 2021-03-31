import { Component, ElementRef, Input, OnInit, Output, ViewChild } from '@angular/core';
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
  @ViewChild('outplug', {static: true}) plug: ElementRef;
  constructor(private parent: OverviewComponent,
              private project: ProjectComponent) { }

  @Input() boarditem: BoardItem;

  isExpanded = false;
  @Output() subitems;

  OnExpandButton(i) {
    if (this.isExpanded) {
      this.isExpanded = false;
      this.subitems = null;
    }
    else {
      this.isExpanded = true;
      this.project.monday.SubItems$(i.subitem_ids).subscribe((subitems) => {
          this.subitems = _.map(subitems, s => new SubItem(s))
          this.boarditem.subitems = this.subitems;
          this.parent.UpdateBoardItem(this.boarditem);
        }
      )
    }

    this.parent.BoardItems$.pipe(take(1)).subscribe((items) => {
      let entry = _.find(items, e => e.id == i.id);
      entry.subitems = this.subitems;
      this.parent.UpdateBoardItem(items);
    });
  }

  ngOnInit(): void {
  }

}
