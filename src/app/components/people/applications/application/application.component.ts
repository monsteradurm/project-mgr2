import { Component, OnInit, Input, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { Application, ApplicationsComponent } from '../applications.component';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { shareReplay, take, switchMap, map } from 'rxjs/operators';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { UseExistingWebDriver } from 'protractor/built/driverProviders';
import * as _ from 'underscore';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss']
})
export class ApplicationComponent implements OnInit, OnDestroy {

  Hovering: boolean = false;
  HasContext:boolean = false;
  contextMenuPosition = { x: '0px', y: '0px' };
  User$ = this.parent.User$;

  @ViewChild(MatMenu, {static:false}) contextMenu:MatMenu;
  @ViewChild(MatMenuTrigger, {static:false}) contextMenuTrigger: MatMenuTrigger;

  @HostListener('mouseover', ['$event']) onMouseOver(evt) {
    this.Hovering = true;
  }

  @HostListener('mouseout', ['$event']) onMouseLeave(evt) {
    if (!this.HasContext)
      this.Hovering = false;
  }

 @HostListener('contextmenu', ['$event']) onContextMenu(event) {
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenuTrigger.toggleMenu()
    this.HasContext = true;
    event.preventDefault();
  }


  onContextClosed() {
    this.HasContext = false;
    this.Hovering = false;
  }

  RateResponse(rating: number ) {

  }
  RemoveResponse() {
    this.Application$.pipe(take(1)).subscribe(app => {
      this.parent.RemoveResponse(app.response_id);
    });
  }
  constructor(private parent: ApplicationsComponent) { }

  private applicant = new BehaviorSubject<Application>(null);
  Application$ = this.applicant.asObservable().pipe(shareReplay(1));
  ResponseData$ = this.Application$.pipe(
    switchMap(app => app ?
      this.parent.firebase.TypeformResponses$(app.form_id, app.response_id)
      : of(null)
    )
  )

  Ratings$ = this.ResponseData$.pipe(
    map((data:any) => data ? data.ratings : { })
  )

  AverageRating$ = this.Ratings$.pipe(
    map((ratings: any) => {
      if (!ratings)
        return 0;

      let result = 0;
      _.forEach(Object.keys(ratings), k => result += ratings[k])
    })
  )

  MyRating$ = combineLatest([this.Ratings$, this.AverageRating$, this.User$]).pipe(
    map(([ratings, avg, user]) => {
      if (!ratings) return 0;

      if (!user) return avg;

      if (ratings[user.id])
        return ratings[user.id];
      return avg;
    })
  )
  @Input() set Applicant(s: Application) {
    this.applicant.next(s);
  }


  get primaryColor() { return this.parent.primaryColor; }

  subscriptions = [];

  ngOnInit(): void {

  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  RetrieveFile(answer:any) {
    this.Application$.pipe(take(1)).subscribe(app => {
      this.parent.RetrieveFile(answer, app.response_id);
    });

  }

  ShowComments: boolean = false;

}

export class AppResponseData {
  ratings: { user: string, rating: number}[]
  notes: { user: string, note: string }[]
}
