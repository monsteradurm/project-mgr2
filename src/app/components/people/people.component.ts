import { Component, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AppComponent } from 'src/app/app.component';
import { UserIdentity } from 'src/app/models/UserIdentity';
import { ConfluenceService } from 'src/app/services/confluence.service';
import { MondayService } from 'src/app/services/monday.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { SyncSketchService } from 'src/app/services/sync-sketch.service';
import { UserService } from 'src/app/services/user.service';

import * as _ from 'underscore';

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss']
})
export class PeopleComponent implements OnInit, OnDestroy {

  private error = new BehaviorSubject<string>(null);

  @Output() primaryColor: string = 'gray'; 

  displayedColumns = ['Avatar', 'Email', 'Role', 'Manager', 'Remote', 'Confluence', 'Monday', 'SyncSketch']
  GraphUsers$ = this.UserService.AllUsers$;
  MondayUsers$ = this.monday.MondayUsers$.pipe(shareReplay(1));
  SyncUsers$ = this.syncSketh.AllUsers$.pipe(shareReplay(1));
  ConfluenceUsers$ = this.confluence.Users$.pipe(shareReplay(1));
  Error$ = this.error.asObservable().pipe(shareReplay(1));

  AllUsers$ = combineLatest([this.GraphUsers$, this.MondayUsers$, this.SyncUsers$, this.ConfluenceUsers$ ]).pipe(
    map(
      ([graph, monday, sync, confluence]) => {

      let allUsers = _.groupBy(graph, g => g.mail);
      allUsers = _.map(allUsers, u => ({ 
          graph: u[0], 
          photo: this.UserService.UserPhoto$(u[0].mail),
          monday: _.find(monday, m=> m.email == u[0].mail ),
          sync: _.find(sync, s => s.email == u[0].mail),
          confluence: _.find(confluence, c => c.displayName == u[0].givenName + ' ' + u[0].surname)
        })
      )
      
      return _.chain(allUsers).sortBy(a => a.graph.givenName).sortBy(a => a.graph.surname).value();
    })
  )

  subscriptions = [];
  constructor(private UserService: UserService,
    private syncSketh: SyncSketchService, 
    private confluence: ConfluenceService,
    private monday: MondayService, 
    private nav: NavigationService) { 
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.nav.PrimaryColor$.subscribe(c => this.primaryColor = c)
     )
  }

  
}
