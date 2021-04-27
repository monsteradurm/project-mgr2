import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { BoardItem } from 'src/app/models/BoardItem';

@Pipe({
  name: 'TaskSortBy$'
})

export class TaskSortByDirective  {
  transform(Items$: Observable<BoardItem[]>, Status$: Observable<string> ) {

    return combineLatest([Items$, Status$]).pipe(
        map(([items, status]) => {
            console.log("SORT BY: ", status);
            return items;
        }));
  }
}
