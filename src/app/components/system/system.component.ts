import { Component, OnInit, Output } from '@angular/core';
import { geoConicConformalRaw } from 'd3-geo';
import { BehaviorSubject, of } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { BoxService } from 'src/app/services/box.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { MondayService } from 'src/app/services/monday.service';
import { NavigationService } from 'src/app/services/navigation.service';

import * as _ from 'underscore';

@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss']
})
export class SystemComponent implements OnInit {

  constructor(
    public firebase: FirebaseService,
    public navigation:NavigationService, 
    private monday: MondayService) { }

  
  private boardId = new BehaviorSubject<string>(null);
  BoardId$ = this.boardId.asObservable().pipe(shareReplay(1));

  Settings$ = this.BoardId$.pipe(
    switchMap(id => id ? this.monday.ProjectSettings$(id) : of(null)),
    map(page => {
      if (!page) return;

      let groups = Object.keys(page);
      return _.map(groups, g=> ({
        title: g,
        items: page[g]
      }))
    }),
  )

  @Output() primaryColor;
  subscriptions = []
  NavigationChild: string;

  ngOnInit(): void {
    this.subscriptions.push(
      this.navigation.PrimaryColor$.subscribe(c => this.primaryColor = c)
     )

     this.subscriptions.push(
       this.navigation.NavigationChildren$.subscribe(url => {
         if (url.length > 0)
          this.NavigationChild = url[0];
       })
     )
     this.subscriptions.push(
      this.navigation.NavigationParameters$.subscribe(
        (params:any) => {
          if (params && params.board) {
            this.boardId.next(params.board);
          }

          if (params && params.name) {
            this.navigation.SetPageTitles([params.name]);
          }
        }
      )
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

}
