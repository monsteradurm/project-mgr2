import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Pipe({
  name: 'FilterItemsByStatus$'
})

export class FilterItemsByStatusPipe  {
  transform(items$: Observable<any[]>, status$: Observable<string[]>) {

    return combineLatest([items$, status$]).pipe(
      map(([items, status]) => {
        if (!status || status.length < 1) return items;
        
        let filtered = _.filter(items, i => {
            let label = "Not Started"
            if (i && i.status && i.status.text)
              label = i.status.text;

            return status.indexOf(label) == -1
        });

        return filtered;
      })
    )
  }
}
