import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, of } from 'rxjs';
import { tap, map, switchMap, shareReplay } from 'rxjs/operators';
import { BoardItem, SubItem } from 'src/app/models/BoardItem';
import { MondayService } from 'src/app/services/monday.service';
import { SyncSketchService } from 'src/app/services/sync-sketch.service';

@Pipe({
  name: 'FetchUpdatesToSyncItem$'
})

export class FetchUpdatesToSyncItemPipe  {
    constructor(private syncSketch: SyncSketchService) { }
  transform(id: string) {
    return this.syncSketch.Updates$(id);
  }
}
