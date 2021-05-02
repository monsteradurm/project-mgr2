import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Pipe({
    name: 'GroupBy$'
})

export class GroupbyPipe {
    transform(items$: Observable<any[]>, attr: string, stringify: boolean) {
        if (!attr)
            return items$;

        return items$.pipe(
            map(items => stringify ?
                _.groupBy(items, i => JSON.stringify(i[attr])) :
                _.groupBy(items, i => i[attr]))
        )
    }
}
