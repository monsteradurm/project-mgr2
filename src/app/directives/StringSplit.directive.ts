import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Pipe({
  name: 'StringSplit'
})

export class StringSplitPipe  {
  transform(val: string, delim: string) {
    if (!val || !delim) return val;

    return val.split(delim);
  }
}
