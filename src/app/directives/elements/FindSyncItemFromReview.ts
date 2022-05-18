import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, of } from 'rxjs';
import { tap, map, switchMap, catchError, take } from 'rxjs/operators';
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
        switchMap(r => {
            console.log("FOUND REVIEW: ", r);

            if (!subitem || !subitem.id)
                throw 'no subitem to map';

            return this.syncSketch.Items$(r.id).pipe(
              map((items: any[]) => _.filter(items, (i) => i.name.indexOf(subitem.id + '_') == 0)),
              map((items: any[]) => _.sortBy(items, i => i.created).reverse()),
              map((items: any[]) => _.forEach(items, (i:any) => i.reviewURL = r.reviewURL)),
              tap(t => console.log("SORTED ITEMS", t)),
              take(1)
            )
            /*
            let items = _.filter(review.items, (i) => i.name.indexOf(subitem.id + '_') == 0);
            items.forEach(item => item.reviewURL = review.reviewURL);
            return of(_.sortBy(items, i => i.created).reverse())*/
        }),
        catchError(err => {
            console.log(err);
            return of([]);
        }),
    )
  }
}
