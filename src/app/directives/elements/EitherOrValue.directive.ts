import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, isObservable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { BoardItem } from 'src/app/models/BoardItem';

@Pipe({
  name: 'EitherOrValue'
})

export class EitherOrValueDirective  {
  transform(fv: any, sv: any) {
    if (Array.isArray(fv)) {
      return this.EitherOrArray(fv, sv)
    }

    if (sv)
      return sv;
    if (!fv && sv)
      return sv;
    else if (fv && !sv)
      return fv;

    return fv;
  }

  EitherOrArray(fv:any[], sv:any[]) {
    if (fv && fv.length > 0 && (!sv || sv.length < 1))
      return fv;

    else if (sv && sv.length > 0 && (!fv || fv.length < 1))
      return sv;

    else if (sv)
      return sv;
    
    return fv;
  }
}
