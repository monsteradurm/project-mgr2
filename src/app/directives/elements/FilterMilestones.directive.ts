import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { BoardItem } from 'src/app/models/BoardItem';

@Pipe({
  name: 'FilterMilestones'
})

export class FilterMilestonesPipe  {
  transform(items: BoardItem[], exclude:boolean = true) {

    return _.filter(items, i => exclude ? !i.is_milestone() : i.is_milestone())
  }
}
