import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationService } from '../../../services/navigation.service';
import { TypeformService } from '../../../services/typeform.service';
import { map, tap, shareReplay, switchMap } from 'rxjs/operators';
import { PeopleComponent } from '../people.component';

import * as _ from 'underscore';
import { _getOptionScrollPosition } from '@angular/material/core';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit, OnDestroy {

  constructor(private nav: NavigationService,
              private parent: PeopleComponent,
              private typeform: TypeformService) { }

  subscriptions = [];
  primaryColor = "rgb(153, 87, 255)";

  Id$ = this.parent.Parameters$.pipe(
    map(params => params.id),
    shareReplay(1)
  )

  Responses$ = this.Id$.pipe(
    tap(t => console.log("ID: ", t)),
    switchMap(id => this.typeform.Form$(id)),
    map((result:any) => result.items ? result.items : []),
    tap(items => console.log(items)),
    map((items:any[]) => _.map(items, item => new Application(item))),
    map((items:any[]) => _.sortBy(items, item => item.Name)),
  )
  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  ngOnInit(): void {

  }

}

class Application {
  public Name: string;
  public Email: string;
  public Phone: string;
  public URL: string;
  public Submitted: string;

  entry: any;
  constructor(entry: any) {
    entry = entry;

    let answers = entry.answers;
    let name = _.find(answers, a=> a.field.ref.toLowerCase().indexOf('fullname') > -1);
    if (name)
      this.Name = name.text;

    let email = _.find(answers, a=> a.email);
    if (email)
      this.Email = email.email;

    let phone = _.find(answers, a=> a.phone_number);
    if (phone)
      this.Phone = phone.phone_number;

    let url = _.find(answers, a=> a.url);
    this.URL = url.url;

    this.Submitted = entry.submitted_at;
  }
}
