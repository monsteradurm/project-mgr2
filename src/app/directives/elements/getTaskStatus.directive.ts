import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Pipe({
  name: 'GetTaskStatus'
})

export class GetTaskStatusDirective  {
  transform(status: any) {
    if (!status || !status.additional_info)
        return { text: 'Not Started', color: 'black'}

    return { text: status.text, color: status.additional_info.color}
  }
}
