import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import * as moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, shareReplay, take, tap } from 'rxjs/operators';
import { DropDownMenuGroup } from '../components/navigation/navigation-map';
import { BoardItem } from '../models/BoardItem';
import { FirebaseUpdate } from '../models/Firebase';
import { BoardItemUpdate, BoardUpdate } from '../models/Socket';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  NavigationItems$ = this.afs.collection<Partial<DropDownMenuGroup>>('Navigation').valueChanges().pipe(
    shareReplay(1)
  )
  
  private CachedProjects$ = this.afs.doc<Partial<FirebaseUpdate>>('Projects/yYrxj9Ku0b7weXQWQn5D');
  Projects$ = this.CachedProjects$.valueChanges().pipe(
    shareReplay(1)
  )

  private CachedBoards$ = this.afs.doc<Partial<FirebaseUpdate>>('Boards/1pzws4CFn4edRJvYMljS');
  Boards$ = this.CachedBoards$.valueChanges().pipe(
    shareReplay(1)
  )

  private LastBoardItemUpdate$ = this.afs.doc<BoardItemUpdate>('BoardItemUpdates/7VrEALAlJjcotl076vz2');
  BoardItemUpdates$: Observable<BoardItemUpdate> = this.LastBoardItemUpdate$.valueChanges().pipe(
    distinctUntilChanged((a,b) => a && b && a.updated == b.updated && a.user_id == b.user_id),
  )


  private LastBoardUpdate$ = this.afs.doc<BoardItemUpdate>('BoardUpdates/2MzKxcUSDkp3GPBN56Ov');
  BoardUpdates$: Observable<BoardUpdate> = this.LastBoardUpdate$.valueChanges().pipe(
    distinctUntilChanged((a,b) => a && b && a.updated == b.updated && a.user_id == b.user_id),
  )


  private LastIssueUpdate$ = this.afs.doc<any>('IssueUpdates/vSTF7rrJRRuYB5wgdtq4');
  IssueUpdates$: Observable<any> = this.LastIssueUpdate$.valueChanges().pipe(
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

  private StoreCachedUpdate(doc: AngularFirestoreDocument<Partial<FirebaseUpdate>>, update: FirebaseUpdate) {
    doc.update({ updated: update.updated, json: update.json }).then(console.log);
  }

  CacheProjects(update: FirebaseUpdate) {
    console.log("Storing Projects in Firebase...")
    this.StoreCachedUpdate(this.CachedProjects$, update);
  }

  CacheBoards(update: FirebaseUpdate) {
    console.log("Storing Boards in Firebase...")
    this.StoreCachedUpdate(this.CachedBoards$, update);
  }

  GetGroupItems$(board_id: string, group_id: string) {
    return this.afs.doc<any>('BoardItems/' + board_id + '_' + group_id).valueChanges();
  }

  SendIssueUpdate() {
    this.LastIssueUpdate$.update({user_id: this.user, updated: this.now})
  }

  SendBoardUpdate(board_id:string, group_id:string) {
    this.LastBoardUpdate$.update({ board_id, group_id, user_id: this.user, updated: this.now });
  }

  SendBoardItemUpdate(board_id:string, group_id:string, item_id) {
    this.LastBoardItemUpdate$.update({ board_id, group_id, item_id, user_id: this.user, updated: this.now });
  }
}
