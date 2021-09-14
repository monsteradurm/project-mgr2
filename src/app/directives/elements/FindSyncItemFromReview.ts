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
  name: 'FindSyncItemFromReview$'
})

export class FindSyncItemFromReviewPipe  {
constructor(private sanitizer: DomSanitizer,
            private afs: AngularFirestore,
            private syncSketch: SyncSketchService) { }

  transform(review$: Observable<any>, subitem: SubItem) {
    return review$.pipe(
        switchMap(review => {

            if (!review || !review.reviewid)
                throw 'no review item to map';
            if (!subitem || !subitem.id)
                throw 'no subitem to map';
            
            let items = _.filter(review.items, (i) => i.name.indexOf(subitem.id + '_') == 0);
            items.forEach(item => item.reviewURL = review.reviewURL);
            return of(_.sortBy(items, i => i.created).reverse())
        }),
        catchError(err => {
            console.log(err);
            return of([]);
        }),
    )
  }
}
