import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Pipe({
  name: 'ArrayToStr'
})

export class ArrayToStrDirective  {
  transform(items: any[], attr: string) {
    if (!items || items.length < 1)
        return null;

    let result = _.map(items, i => i[attr]).join(", ");

    if (result.trim().length > 0)
      return result;
    return null;
  }
}
