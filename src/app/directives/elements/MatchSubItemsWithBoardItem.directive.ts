import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, of } from 'rxjs';
import { tap, map, switchMap, shareReplay } from 'rxjs/operators';
import { BoardItem, SubItem } from 'src/app/models/BoardItem';
import { MondayService } from 'src/app/services/monday.service';

@Pipe({
  name: 'MatchSubitemsWithBoardItem'
})

export class MatchSubItemsWithBoardItemPipe  {
    constructor(private monday: MondayService) { }
  transform(Item: BoardItem, SubItems: SubItem[]) {
 
    if (!Item || !Item.subitem_ids || Item.subitem_ids.length < 1)
      return Item;
    if (!SubItems || SubItems.length < 1)
      return Item;

    let ids = _.map(Item.subitem_ids, i => i.toString());
    Item.subitems = _.filter(SubItems, (i:SubItem) => ids.indexOf(i.id) > -1);
    Item.isExpanded = false;
    return Item;
  }
}
