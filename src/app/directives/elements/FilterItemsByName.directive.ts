import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Pipe({
  name: 'FilterItemsByName$'
})

export class FilterItemsByNameDirective  {
  transform(items$: Observable<any[]>, name$: Observable<string>) {

    return combineLatest([items$, name$]).pipe(
      map(([items, name]) => {
        let filter = name.toLowerCase();

        if (!filter || filter.length < 1)
          return items;

        console.log(filter, items);
        return _.filter(items, i => i.name.toLowerCase().indexOf(filter) > -1)
      })
    )
  }
}
