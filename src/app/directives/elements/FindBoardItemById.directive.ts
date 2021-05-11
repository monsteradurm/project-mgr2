import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, of } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
import { BoardItem, SubItem } from 'src/app/models/BoardItem';

@Pipe({
  name: 'FindBoardItemById'
})

export class FindBoardItemByIdPipe  {
  transform(Item: BoardItem, SubItems: SubItem[], Departments: any[], selected: string) {
    if (!selected || Item.id.toString() == selected) return Item;
      
      let item =  _.find(SubItems, i => selected == i.id);
      if (item) {
        if (item.task)
          item.type == 'task'
        else {
          item.type = 'revision'
        }
        return item;
      }
      
      item = _.find(Departments, i => selected == i.id);
      if (item)
        item.type == 'department';
      
      return item;
  }
}
