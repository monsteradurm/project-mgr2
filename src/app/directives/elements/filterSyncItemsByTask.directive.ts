import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, of } from 'rxjs';
import { tap, map, switchMap, catchError } from 'rxjs/operators';
import { BoardItem } from 'src/app/models/BoardItem';
import { DomSanitizer } from '@angular/platform-browser';
import { SyncSketchService } from 'src/app/services/sync-sketch.service';

@Pipe({
  name: 'FilterSyncItemsByTask$'
})

export class FilterSyncItemsByTaskPipe  {
constructor(private sanitizer: DomSanitizer,
            private syncSketch: SyncSketchService) { }
  transform(review$: Observable<any>, view: BoardItem, department: string) {
    
    return review$.pipe(
        switchMap(review => {
            if (!review || !review.id)
                throw 'no review item to map';

            return this.syncSketch.Items$(review.id).pipe(
                map((items: any[]) => 
                    _.filter(items, i => {
                        let nameArr = i.name.split('/');
                        let d = nameArr[0];
                        
                        
                        if (department.indexOf(d) < 0) return false;

                        if (view.task != nameArr[1])
                            return false;
                            
                        i['review'] = review.reviewURL + '#/' + i.id;

                        return true;
                    })
                ),
                tap(console.log)
            )
        }),
        catchError(err => {
            console.log(err);
            return of([]);
        }),
        tap(console.log)
    )
    
  }
}
