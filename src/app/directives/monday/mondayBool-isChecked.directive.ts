import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'MondayBoolIsChecked'
})

export class MondayBoolIsCheckedPipe  {
  transform(value: string) {
    if (!value) return null;
    
      let v = JSON.parse(value);
      
      if (!v.checked)
        return false;
      return true;
  }
}
