import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Pipe({
  name: 'ParseJSON'
})

export class ParseJSONPipe  {
  transform(stringified: string) {
   return JSON.parse(stringified);
  }
}
