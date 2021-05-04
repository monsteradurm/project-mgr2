import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { map, take } from 'rxjs/operators';
import { Board, BoardItem } from '../models/BoardItem';
import { ScheduledItem } from '../models/Monday';
import { MondayService } from './monday.service';
import { SocketService } from './socket.service';
import { UserService } from './user.service';
import * as _ from 'underscore';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private monday: MondayService,
    private userService: UserService,
    private socket: SocketService,
    private messenger: MessageService) {
  }

  QueryStatusChanged(item, column) {
    let label = column.label;
    if (
      (!item.status && label == "Not Started") ||
      (item.status && (!item.status.text && label == "Not Started")) ||
      (item.status && (label == item.status.text))
    ) {
      this.messenger.add({
        severity: 'info',
        summary: 'Status is already "' + label + '"',
        life: 3000,
        detail: item.name
      });
      return false;
    }
    return true;
  }

  Boards$ = this.monday.Boards$;
  GetStatusOptions$(boardid) {
    return this.Boards$.pipe(
      map(boards => _.find(boards, b => b.id == boardid)),
      map(board => board.columns),
      map(columns => _.find(columns, c => c.title == "Status")),
      map(status => {
        let settings = JSON.parse(status.settings_str)
        let indices = Object.keys(settings.labels);
        let result = [];
        indices.forEach(i => {
          let option = settings.labels_colors[i];
          option.index = i;
          option.column_id = status.id;
          option.label = settings.labels[i];
          result.push(option);
        });
        return _.sortBy(result, r => r.label);
      }),
      take(1)
    )
  }
  SetItemStatus(boardid: string, item: BoardItem | ScheduledItem, column: any) {
    if (!this.QueryStatusChanged(item, column))
      return;

    this.monday.SetBoardItemStatus$(boardid, item.id.toString(), column.column_id, column.index)
      .pipe(take(1))
      .subscribe((result: any) => {
        if (result && result.change_simple_column_value && result.change_simple_column_value.id) {
          this.messenger.add({ severity: 'success', summary: 'Status Updated', detail: item.name });

          this.socket.SendBoardItemUpdate(boardid, item.group.id, item.id);

        } else {
          this.messenger.add({ severity: 'error', summary: 'Error Updating Status', detail: item.name })
        }
      })
  }
}