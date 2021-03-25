import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest } from 'rxjs';
import { of, from, merge } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Department } from './../../models/Department';

@Pipe({
  name: 'FilterItemsByDepartment$'
})

export class FilterItemsByDepartmentPipe  {
  transform(items$: Observable<any[]>, department$: Observable<Department>) {

    return combineLatest([items$, department$]).pipe(
      map(([items, department]) => {
        if (!department) return [];
        let dep = department.id;

        return _.filter(items, i =>
          _.map(i.department, d=> d.id)
          .indexOf(dep) >= 0);
      })
    )
  }
}
