import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, isObservable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { BoardItem } from 'src/app/models/BoardItem';

@Pipe({
  name: 'FindById'
})

export class FindByIdPipe  {
  transform(id:string | number, items:any[]) {
    console.log(id, items);
    return _.find(items, i=> i.id.toString() == id.toString())
  }
}
