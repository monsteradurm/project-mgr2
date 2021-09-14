// https://syncsketch.com/api/v1/item/{{item_id}}/

import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, of } from 'rxjs';
import { tap, map, switchMap, catchError } from 'rxjs/operators';
import { BoardItem, SubItem } from 'src/app/models/BoardItem';
import { DomSanitizer } from '@angular/platform-browser';
import { SyncSketchService } from 'src/app/services/sync-sketch.service';
import { ScheduledItem } from 'src/app/models/Monday';
import { AngularFirestore } from '@angular/fire/firestore';

@Pipe({
  name: 'GetSyncThumbnail$'
})

export class GetSyncThumbnail  {
constructor(private syncSketch: SyncSketchService) { }

  transform(item: any) {     
      return this.syncSketch.GetThumbnail$(item.id)
    }
}
