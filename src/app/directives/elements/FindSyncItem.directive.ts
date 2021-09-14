import { Pipe } from '@angular/core';
import * as _ from 'underscore';
import { Observable, combineLatest, of } from 'rxjs';
import { tap, map, switchMap, catchError } from 'rxjs/operators';
import { BoardItem, SubItem } from 'src/app/models/BoardItem';
import { DomSanitizer } from '@angular/platform-browser';
import { SyncSketchService } from 'src/app/services/sync-sketch.service';
import { ScheduledItem } from 'src/app/models/Monday';
import { AngularFirestore } from '@angular/fire/firestore';

@Pipe({
  name: 'FindSyncItem$'
})

export class FindSyncItemPipe  {
constructor(private sanitizer: DomSanitizer,
            private afs: AngularFirestore,
            private syncSketch: SyncSketchService) { }

  transform(item: BoardItem | ScheduledItem, subitem: SubItem) {
      let ws = item.workspace.name;
      let board = item.board.name.replace('/', '_._');
      let boardid = item.board.id;
      let group = item.group.title;
      let fs_project = ws +', ' + board;
      let fs_review = boardid + "_" + group + '_._' + item.element;
    
      return this.afs.collection('SyncSketchProjects')
        .doc(fs_project)
        .collection('reviews')
        .doc(fs_review)
        .get().pipe(
            map(t => {
                if (t.exists) {
                    let data = t.data();
                    let url = data.reviewURL;
                    data.items.forEach(i => i.reviewURL = url);
                    return _.filter(data.items, i => i.name.indexOf(subitem.id + '_') == 0);
                }
                return [];
            }),
            
            map((items:any[]) => _.sortBy(items, i => i.created).reverse()),
            catchError(err => {
                console.log(err);
                return of([]);
            }),     
        )
    }
    
  /*
  transform(review$: Observable<any>, subitem: SubItem) {
    return review$.pipe(
        switchMap(review => {

            if (!review || !review.id)
                throw 'no review item to map';
            if (!subitem || !subitem.id)
                throw 'no subitem to map';


            return this.syncSketch.Items$(review.id).pipe(
                map((items: any[]) =>
                    _.filter(items, i => i.name.indexOf(subitem.id + '_') == 0)
                ),

                map((items:any) => {
                    if (!items)
                        return [];

                    items.forEach(item => item.reviewURL = review.reviewURL);
                    return items;
                }),
                map((items:any[]) => _.sortBy(items, i => i.created).reverse())
            )
        }),
        catchError(err => {
            console.log(err);
            return of([]);
        }),
    )*/
}
