import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, take, tap } from 'rxjs/operators';
import { BoardItem } from '../models/BoardItem';
import { BoardItemUpdate, BoardUpdate } from '../models/Socket';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private user;
  private _TestConnection(msg: string) {
    this.socket.emit('test-message', { msg });
  }

  private _ReceiveTestConnection() {
    return this.socket.fromEvent('test-message');
  }

  
  BoardItemUpdates$: Observable<BoardItemUpdate> = this.socket.fromEvent('boarditem-update')
  BoardUpdates$: Observable<BoardUpdate> = this.socket.fromEvent('board-update')

  SendBoardUpdate(board_id:string, group_id:string) {
    this.socket.emit('send-board-update', { board_id, group_id, user_ud: this.user });
  }

  SendBoardItemUpdate(board_id:string, group_id:string, item_id) {
    this.socket.emit('send-boarditem-update', { board_id, group_id, item_id, user_id: this.user });
  }

  constructor(private socket: Socket, private UserService: UserService) {
    this.UserService.User$.subscribe((user) => {
      if (!user)
        return;
        
      this.user = user.id;
      console.log("Setting Socket.IO for User:", this.user);
    })

    console.log("Starting Socket Service...")
    this._ReceiveTestConnection().pipe(take(1)).subscribe((msg) => {
      console.log("Socket Connection established...")
    });

    this._TestConnection('Testing Socket Connection...');
   }
}
