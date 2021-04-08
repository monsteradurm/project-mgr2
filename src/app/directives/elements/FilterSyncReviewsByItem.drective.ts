import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { BoardItem } from 'src/app/models/BoardItem';

@Pipe({
  name: 'FilterSyncReviewsByItem$'
})

export class FilterSyncReviewsByItemPipe  {
  transform(reviews$: Observable<any[]>, item: BoardItem) {

    return reviews$.pipe(
        map(reviews => {
          if (!reviews || reviews.length < 1) return [];
          return _.find(reviews, r => 
            r.name == item.group.title + '/' + item.element 
          );
        })
      )
  }
}
