import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  sendMessage(msg: string) {
    this.socket.emit('message', msg);
  }

  getMessage() {
    return this.socket.fromEvent('message').pipe(
      tap(console.log)
    );
  }

  constructor(private socket: Socket) { }
}
