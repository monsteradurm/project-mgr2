import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, of } from 'rxjs';
import { tap, map, switchMap, shareReplay } from 'rxjs/operators';
import { BoardItem, SubItem } from 'src/app/models/BoardItem';
import { MondayService } from 'src/app/services/monday.service';
import { ScheduledItem } from 'src/app/models/Monday';

@Pipe({
  name: 'GetLastSubItemByBoardItem$'
})

export class GetLastSubItemByBoardItemPipe  {
    constructor() { }

  transform(SubItems$: Observable<SubItem[]>, Item: BoardItem | ScheduledItem) {

    
    return SubItems$.pipe(
      map(SubItems => {
        if (!SubItems || SubItems.length < 1 || !Item || !Item.subitem_ids || Item.subitem_ids.length < 1)
          return null;
    
        let ids = _.map(Item.subitem_ids, i => i.toString());
        let id = ids.length > 0 ? ids[ids.length - 1] : null
        if (!id)
          return null;

        return  _.find(SubItems, (i:SubItem) => id.toString() == i.id.toString()); 
      })
    )                
  }
}
