import { Component, OnInit, Input, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { Application, ApplicationsComponent } from '../applications.component';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { shareReplay, take, switchMap, map } from 'rxjs/operators';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { AngularEditorConfig } from '@kolkov/angular-editor';

import * as _ from 'underscore';
import { DateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss']
})
export class ApplicationComponent implements OnInit, OnDestroy {
  editorConfig: AngularEditorConfig = {
    editable: true,
      spellcheck: true,
      height: 'auto',
      minHeight: '100',
  };

  Hovering: boolean = false;
  HasContext:boolean = false;
  contextMenuPosition = { x: '0px', y: '0px' };
  User$ = this.parent.User$;

  newComment: string = "";

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
  ResponseData$: Observable<{ratings: any, notes:any[]}> = this.Application$.pipe(
    switchMap(app => app ?
      this.parent.firebase.TypeformResponses$(app.form_id, app.response_id)
      : of(null)
    )
  )

  Ratings$ = this.ResponseData$.pipe(
    map((data:{ratings: any, notes:any[]}) => data ? data.ratings : { })
  )

  Notes$ = this.ResponseData$.pipe(
    map((data:{ratings: any, notes:any[]}) => data ? data.notes : [])
  );

  AverageRating$ = this.Ratings$.pipe(
    map((ratings: any) => {
      if (!ratings)
        return 0;

      let result = 0;
      let keys = Object.keys(ratings);
      _.forEach(keys, k => result += ratings[k])
      return result / keys.length;
    })
  )

  SetRating(r) {
    console.log(r);
  }

  AddComment() {
    combineLatest([this.User$, this.ResponseData$]).pipe(
      map(([user, data]) => {
        if (!data.notes) data.notes = [];
        data.notes.push({
          user: user.id,
          submitted: Date.now(),
          note: this.newComment
        });
        return data;
      }),
      take(1)
    ).subscribe((data) => {
      this.Application$.pipe(
        switchMap((app:Application) => 
          this.parent.firebase.SetTypeformResponse$(app.form_id, app.response_id, data)
        ),
        take(1)
      ).subscribe((result) => {
        this.parent.messaging.add({severity: 'success', detail: 'Success', summary: 'Added Comment'});
      })
    })
  }
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
