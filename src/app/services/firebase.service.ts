import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentSnapshot, QueryDocumentSnapshot } from '@angular/fire/firestore';
import * as moment from 'moment';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { DropDownMenuGroup } from '../components/navigation/navigation-map';
import { BoardItem } from '../models/BoardItem';
import { FirebaseUpdate } from '../models/Firebase';
import { ScheduledItem } from '../models/Monday';
import { BoardItemUpdate, BoardUpdate } from '../models/Socket';
import { UserService } from './user.service';
import * as _ from 'underscore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  TypeFormRespondents = {

  }

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

  /*
  TypeForms$ = this.afs.collection("Typeforms").get().pipe(
    map(result => result.docs),
    map(result => _.map(result, d => d.data())),
    take(1),
    shareReplay(1)
  )
  */
  SetTypeformResponse$(form_id, response_id, data) {
    console.log(form_id, response_id, data);
    let key = form_id + '_' + response_id;
    return from(this.afs.collection("Typeforms").doc(form_id).collection('responses').doc(response_id).set(data));
  }

  TypeformResponses$(form_id, response_id) : Observable<{ratings: any, notes:any[]}>{
    let key = form_id + '_' + response_id;

    if (this.TypeFormRespondents[key])
      return this.TypeFormRespondents[key];

      this.TypeFormRespondents[key] = this.afs.collection("Typeforms").doc(form_id).get().pipe(
      switchMap((doc:DocumentSnapshot<any>) => {
        if (!doc.exists)
          this.afs.collection("Typeforms").doc(form_id).set({ });

          return this.afs.collection("Typeforms").doc(form_id).collection('responses').doc(response_id).get();
      }),
      switchMap((doc: DocumentSnapshot<any>) => {
        if (!doc.exists)
          this.afs.collection("Typeforms").doc(form_id).collection('responses').doc(response_id).set({
            ratings: { },
            notes: []
          });

        return this.afs.collection("Typeforms").doc(form_id).collection('responses').doc(response_id).valueChanges();
      })
      )
      return this.TypeFormRespondents[key];
    }

  AddBoxWebhook$(id, name) { 
    return this.afs.collection("BoxWebhooks").doc(id).set({
    folder_id: id, name:name, type:"box"
  })
}
  BoxWebhooks$ = this.afs.collection("BoxWebhooks").get().pipe(
      map(result => result.docs),
      map((docs: QueryDocumentSnapshot<any>[]) =>
      _.filter(
        _.map(docs, (d: QueryDocumentSnapshot<any>) => {
          let result = d.data()
          result.id = d.id;
          return result;

        })), d => d.type == 'box'
      ),
      shareReplay(1)
    )

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

  SyncSketchReview(item: BoardItem | ScheduledItem) {
    var review = `${item.board.id}_${item.group.title}/${item.element}`.replace('/', '_._');
    var project = item.workspace.name + ', ' + item.board.name.replace('/', '_._');
    return from(this.afs.collection('Syncsketch').doc(project).collection('reviews').doc(review).get()).pipe(
      map(doc => doc.exists ? doc.data() : null),
      take(1)
      );
  }

  ReferenceFolder$(item: BoardItem | ScheduledItem) : Observable<any> {
    let ref = this.afs.collection('BoxFolders').doc(item.workspace.name)
    .collection('folders').doc('Reference');
    return ref.get().pipe(
      map(doc => {
        if (!doc.exists) {
          throw 'Could not find Reference Folder for Project: ' + item.workspace.name;
        }
        let data = doc.data();
        if (!data.id) {
          throw 'Could not find Box "Reference" Folder Id for Project: ' + item.workspace.name;
        }
        return data.id;
      }),
      take(1)
    )
  }

  CachedRereferenceFolder(item: BoardItem | ScheduledItem, path:string[]) {
    let reference = this.afs.collection('BoxFolders').doc(item.workspace.name).collection('folders').doc('Reference');
    return reference.get().pipe(
      switchMap(doc => {
        if (!doc.exists) {
          throw 'Could not find Reference Folder for Project: ' + item.workspace.name;
        }
        let last = reference;
        path.forEach(p => {
          last = last.collection('folders').doc(p);
        })
        return last.get();
      }),
      map((doc : DocumentSnapshot<any>) => {
        if (doc.exists) {
          return doc.data();
        }
        return null;
      }),
      take(1)
    )
  }
}

