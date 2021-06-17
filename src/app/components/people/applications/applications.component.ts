import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationService } from '../../../services/navigation.service';
import { TypeformService } from '../../../services/typeform.service';
import { map, tap, shareReplay, switchMap, take } from 'rxjs/operators';
import { PeopleComponent } from '../people.component';

import * as _ from 'underscore';
import { _getOptionScrollPosition } from '@angular/material/core';
import { BehaviorSubject } from 'rxjs';
import { ActionOutletFactory } from '@ng-action-outlet/core';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit, OnDestroy {

  constructor(private nav: NavigationService,
              private parent: PeopleComponent,
              private actionOutlet: ActionOutletFactory,
              private typeform: TypeformService) { }

  private sortBy = new BehaviorSubject<string>('Name');
  SortBy$ = this.sortBy.asObservable().pipe(shareReplay(1));

  SortByOptions = ['Name', 'Email', 'Submitted', 'Location', 'Rating'];

  sortByMenu = this.actionOutlet.createGroup().enableDropdown().setTitle('Sort By')
    .setIcon('sort_by_alpha');

  initializing: boolean = true;

  private reverseSorting = new BehaviorSubject<boolean>(false);
  ReverseSorting$ = this.reverseSorting.asObservable().pipe(shareReplay(1));

  SetReverseSorting() {
    this.ReverseSorting$.pipe(take(1)).subscribe(state => this.reverseSorting.next(!state));
  }

  SetSortBy(s) {
    if (this.initializing) return;
    this.SortBy$.pipe(take(1)).subscribe(sortBy => {
      this.sortBy.next(s);
    })
  }

  RetrieveFile(answer, response_id) {
    this.Id$.pipe(take(1)).subscribe(
      form_id => {
        this.typeform.RetrieveFile$(form_id, response_id, answer).pipe(take(1)).subscribe(result => console.log(result));
      }
    ) 
  }
  SortByMenu$ = this.SortBy$.pipe(
    map((sortBy) => {
      this.initializing = true;
      this.sortByMenu.removeChildren();
      this.sortByMenu.setTitle('Sort By ' + sortBy)
      this.SortByOptions.forEach(o => {
        this.sortByMenu.createButton().setTitle(o).fire$.subscribe(a => this.SetSortBy(o));
      })

      this.initializing = false;
      return this.sortByMenu;
    })
  )


  subscriptions = [];
  primaryColor = "rgb(153, 87, 255)";

  Id$ = this.parent.Parameters$.pipe(
    map(params => params.id),
    shareReplay(1)
  )

  Responses$ = this.Id$.pipe(
    switchMap(id => this.typeform.Form$(id)),
    map((result:any) => result.items ? result.items : []),
    tap(console.log),
    map((items:any[]) => _.map(items, item => new Application(item))),
    map((items:any[]) => _.sortBy(items, item => item.Name)),
  )
  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  ngOnInit(): void {

  }

}

export class Application {
  public Name: string;
  public Email: string;
  public Phone: string;
  public Website: string;
  public Submitted: string;
  public CV: any;
  public Resume: any;
  
  public Location: string;

  public response_id: string;

  entry: any;
  constructor(entry: any) {
    entry = entry;

    this.response_id = entry.response_id;
    
    let answers = entry.answers;
    let name = _.find(answers, a=> a.field.ref == 'Fullname');
    if (name)
      this.Name = name.text;

    let email = _.find(answers, a=> a.field.ref == 'Email');
    if (email)
      this.Email = email.email;

    let phone = _.find(answers, a=> a.field.ref == 'Phone');
    if (phone)
      this.Phone = phone.phone_number;

    let web = _.find(answers, a=> a.field.ref == 'Website');

    if (web)
      this.Website = web.url;

    let cv = _.find(answers, a => a.field.ref == 'CV');
    if (cv)
      this.CV = cv;

    let resume = _.find(answers, a => a.field.ref == 'Resume');
    if (resume)
      this.Resume = resume;

    let location = _.find(answers, a => a.field.ref == 'Location');
    if (location)
      this.Location = location.text;

    this.Submitted = entry.submitted_at;
  }
}
