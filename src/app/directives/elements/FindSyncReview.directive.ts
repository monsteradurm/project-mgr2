import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, of } from 'rxjs';
import { tap, map, switchMap, catchError } from 'rxjs/operators';
import { BoardItem } from 'src/app/models/BoardItem';
import { DomSanitizer } from '@angular/platform-browser';
import { SyncSketchService } from 'src/app/services/sync-sketch.service';
import { ScheduledItem } from 'src/app/models/Monday';

@Pipe({
  name: 'FindSyncReview$'
})

export class FindSyncReviewPipe  {
constructor(private syncSketch: SyncSketchService) { }

  transform(Item: BoardItem | ScheduledItem) {
    return this.syncSketch.FindReview$(Item.board.id, Item.group.title, Item.element)
  }
}
