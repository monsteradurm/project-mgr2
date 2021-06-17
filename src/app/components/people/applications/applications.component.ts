import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationService } from '../../../services/navigation.service';
import { TypeformService } from '../../../services/typeform.service';
import { map, tap, shareReplay, switchMap, take } from 'rxjs/operators';
import { PeopleComponent } from '../people.component';

import * as _ from 'underscore';
import { _getOptionScrollPosition } from '@angular/material/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { ActionOutletFactory } from '@ng-action-outlet/core';
import { MessageService } from 'primeng/api';
import { FirebaseService } from '../../../services/firebase.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit, OnDestroy {

  constructor(private nav: NavigationService,
              public messaging: MessageService,
              private parent: PeopleComponent,
              private actionOutlet: ActionOutletFactory,
              private userservice: UserService,
              public firebase: FirebaseService,
              public typeform: TypeformService) { }

  private sortBy = new BehaviorSubject<string>('Name');
  SortBy$ = this.sortBy.asObservable().pipe(shareReplay(1));

  SortByOptions = ['Name', 'Email', 'Submitted', 'Location'];

  sortByMenu = this.actionOutlet.createGroup().enableDropdown().setTitle('Sort By')
    .setIcon('sort_by_alpha');

  initializing: boolean = true;

  private reverseSorting = new BehaviorSubject<boolean>(false);
  ReverseSorting$ = this.reverseSorting.asObservable().pipe(shareReplay(1));

  private refreshResponses = new BehaviorSubject<boolean>(null);
  RefreshResponses$ = this.refreshResponses.asObservable().pipe(shareReplay(1));

  User$ = this.userservice.User$;

  SetReverseSorting() {
    this.ReverseSorting$.pipe(take(1)).subscribe(state => this.reverseSorting.next(!state));
  }

  RemoveResponse(response_id) {
    this.Id$.pipe(take(1)).subscribe(
      form_id => {
        this.typeform.RemoveResponse$(form_id, response_id).pipe(
          take(1)
        ).subscribe((result) => {
          if (result)
            this.messaging.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Reponse Removed'})
        })
      });
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
        this.typeform.RetrieveFile$(form_id, response_id, answer).pipe(take(1)).subscribe(result => { });
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

  FormId: string;

  Responses$ = combineLatest([this.Id$, this.RefreshResponses$]).pipe(
    tap(([id, refresh]) => this.FormId = id),
    switchMap(([id, refresh]) => this.typeform.Form$(id)),
    map((result:any) => result.items ? result.items : []),
    map((items:any[]) => _.map(items, item => new Application(item, this.FormId))),
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
  public YearsExperience: number;
  public AdditionalNotes: string;
  public Location: string;

  public form_id: string;
  public response_id: string;

  entry: any;
  constructor(entry: any, form_id: string) {
    this.form_id = form_id;
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

    let notes = _.find(answers, a => a.field.ref == 'AdditionalNotes');
    if (notes)
      this.AdditionalNotes = notes.text;

    let experience = _.find(answers, a => a.field.ref == 'YearsExperience');
    if (experience)
        this.YearsExperience = experience.number;
    this.Submitted = entry.submitted_at;
  }
}
