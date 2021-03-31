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
        let label = 'Not Started';

        let filtered = _.filter(items, i => {
            if (i && i.status && i.status.additional_info && i.status.additional_info.label)
                label = i.status.additional_info.label;

            return status.indexOf(label) == -1
        });

        console.log(filtered);
        return [filtered];
      })
    )
  }
}
