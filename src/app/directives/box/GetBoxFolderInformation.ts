import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, of } from 'rxjs';
import { tap, map, switchMap, shareReplay } from 'rxjs/operators';
import { BoardItem, SubItem } from 'src/app/models/BoardItem';
import { MondayService } from 'src/app/services/monday.service';
import { BoxService } from 'src/app/services/box.service';

@Pipe({
  name: 'GetBoxFolderInfo$'
})

export class GetBoxFolderInformationPipe  {
    constructor(private box: BoxService) { }
  transform(id: number) {
    if (!id) return null;

    return this.box.GetFolder$(id.toString());
  }
}