import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Pipe({
    name: 'FilterCompleted$'
})

export class FilterCompletePipe {
    transform(items$: Observable<any[]>, state$: 
        Observable<boolean>) {

        return combineLatest([items$, state$]).pipe(
            map(([items, state]) => !state ? _.filter(items, i => {
                if (!i.status || !i.status.text)
                    return true;
                
                return i.status.text != 'Completed'
            }) : items)
        )
        
    }
}
