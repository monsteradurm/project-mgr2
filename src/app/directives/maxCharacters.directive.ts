import { Input, Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Pipe({
  name: 'maxCharacters'
})

export class MaxCharactersPipe  {
  transform(val: string, MaxLength:number = 20) {
    if (!val) return val;

    if (val.length < MaxLength)
        return val;
        
    return val.substr(0, MaxLength - 3) + '...';
  }
}
