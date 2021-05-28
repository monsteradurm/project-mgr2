import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { distinctUntilChanged, take, tap } from 'rxjs/operators';
import { BoardItem } from '../models/BoardItem';
import { BoardItemUpdate, BoardUpdate } from '../models/Socket';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  
  LastBoardItemUpdate = this.afs.doc<BoardItemUpdate>('BoardItemUpdates/7VrEALAlJjcotl076vz2');
  BoardItemUpdates$: Observable<BoardItemUpdate> = this.LastBoardItemUpdate.valueChanges().pipe(
    distinctUntilChanged((a,b) => a && b && a.updated == b.updated && a.user_id == b.user_id),
  )


  LastBoardUpdate = this.afs.doc<BoardItemUpdate>('BoardUpdates/2MzKxcUSDkp3GPBN56Ov');
  BoardUpdates$: Observable<BoardUpdate> = this.LastBoardUpdate.valueChanges().pipe(
    distinctUntilChanged((a,b) => a && b && a.updated == b.updated && a.user_id == b.user_id),
  )


  LastIssueUpdate = this.afs.doc<any>('IssueUpdates/vSTF7rrJRRuYB5wgdtq4');
  IssueUpdates$: Observable<any> = this.LastIssueUpdate.valueChanges().pipe(
    distinctUntilChanged((a,b) => a && b && a.updated == b.updated && a.user_id == b.user_id),
  )

  user: string;
  constructor(private afs: AngularFirestore, private UserService: UserService) {
      this.UserService.User$.subscribe((user) => {
        if (!user)
          return;
          
        this.user = user.id;
        console.log("Setting Firebase for User:", this.user);
      })
  }

  get now() {
    return moment().toString();
  }

  SendIssueUpdate() {
    this.LastIssueUpdate.update({user_id: this.user, updated: this.now})
  }

  SendBoardUpdate(board_id:string, group_id:string) {
    this.LastBoardUpdate.update({ board_id, group_id, user_id: this.user, updated: this.now });
  }

  SendBoardItemUpdate(board_id:string, group_id:string, item_id) {
    this.LastBoardItemUpdate.update({ board_id, group_id, item_id, user_id: this.user, updated: this.now });
  }
}
