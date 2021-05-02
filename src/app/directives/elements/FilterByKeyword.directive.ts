import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Pipe({
    name: 'FilterByKeyword$'
})

export class FilterByKeywordPipe {
    transform(items$: Observable<any[]>, path: any, keys: string[], match: 'AND' | 'OR') {

        return items$.pipe(
            map(items => _.filter(items, i => {
                let pathArr = path.split('.');
                let value = i;
                pathArr.forEach(p => value = value[p]);

                let matches = true;
                keys.forEach(k => {
                    if (value.indexOf(k) < 0) {
                        if (match == 'AND')
                            return false;
                        else 
                            matches = false;
                    }
                    else if (value.indexOf(k) > -1 && match == 'OR')
                        return true;
                });
                return matches;
            }))
        )
        
    }
}
