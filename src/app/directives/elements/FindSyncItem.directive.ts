import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, of } from 'rxjs';
import { tap, map, switchMap, catchError } from 'rxjs/operators';
import { BoardItem, SubItem } from 'src/app/models/BoardItem';
import { DomSanitizer } from '@angular/platform-browser';
import { SyncSketchService } from 'src/app/services/sync-sketch.service';

@Pipe({
  name: 'FindSyncItem$'
})

export class FindSyncItemPipe  {
constructor(private sanitizer: DomSanitizer,
            private syncSketch: SyncSketchService) { }
  transform(review$: Observable<any>, subitem: SubItem) {

    return review$.pipe(
        switchMap(review => {

            if (!review || !review.id)
                throw 'no review item to map';
            if (!subitem || !subitem.id)
                throw 'no subitem to map';


            return this.syncSketch.Items$(review.id).pipe(
                map((items: any[]) =>
                    _.filter(items, i => i.name.indexOf(subitem.id + '_') == 0)
                ),

                map((items:any) => {
                    if (!items)
                        return [];

                    items.forEach(item => item.reviewURL = review.reviewURL);
                    return items;
                }),
                map((items:any[]) => _.sortBy(items, i => i.created).reverse())
            )
        }),
        catchError(err => {
            console.log(err);
            return of([]);
        }),
    )

  }
}
