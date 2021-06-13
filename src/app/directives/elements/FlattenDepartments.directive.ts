import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, of } from 'rxjs';
import { tap, map, switchMap, shareReplay } from 'rxjs/operators';
import { BoardItem, SubItem } from 'src/app/models/BoardItem';
import { MondayService } from 'src/app/services/monday.service';
import { ScheduledItem } from 'src/app/models/Monday';

@Pipe({
    name: 'FlattenDepartments'
})

export class FlattenDepartmentsPipe {
    constructor() { }

    transform(arr: any[]) {
        if (!arr || !Array.isArray(arr)) return [];

        let result = [];
        _.forEach(arr, a => {
            if (!a.text || a.text.length < 1) { }
            else {
                if (a.text.indexOf(', ') > -1) {
                    a.text.split(', ').forEach(s => {
                        result.push({ id: s, text: s});
                    })
                } else {
                    result.push({id: a.text, text: a.text})
                }
            }
        });
        return result;
    }
}
