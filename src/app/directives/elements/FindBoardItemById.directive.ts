import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, of } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
import { BoardItem, SubItem } from 'src/app/models/BoardItem';

@Pipe({
  name: 'FindBoardItemById'
})

export class FindBoardItemByIdPipe  {
  transform(Item: BoardItem, SubItems: SubItem[], selected: string) {
    console.log(Item, SubItems, selected)
    if (!selected || Item.id.toString() == selected) return Item;
      
      return _.find(SubItems, i => selected == i.id);
  }
}
