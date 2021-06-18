import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { shareReplay, switchMap, take } from 'rxjs/operators';
import { ApplicationComponent } from '../application/application.component';
import { Application } from '../applications.component';

@Component({
  selector: 'app-comment',
  templateUrl: './app-comment.component.html',
  styleUrls: ['./app-comment.component.scss']
})
export class AppCommentComponent implements OnInit {

  private comment = new BehaviorSubject<any>(null);
  Comment$ = this.comment.asObservable().pipe(shareReplay(1));

  private index = new BehaviorSubject<number>(null);
  Index$ = this.index.asObservable().pipe(shareReplay(1));

  get primaryColor() { return this.parent.primaryColor; }
  constructor(private parent: ApplicationComponent) { }
  @Input() set Index(i: number) {
    this.index.next(i);
  }
  @Input() set Comment(c: any) {
    this.comment.next(c);
  }

  RemoveComment() {
    combineLatest([this.Index$, this.parent.ResponseData$]).pipe(take(1)).subscribe(
      ([index, data]) => {
        data.notes.splice(index, 1);
        this.parent.SetResponse(data, "Removed Comment");
      })
  }
  ngOnInit(): void {
  }

  Hovering: boolean = false;
  HasContext:boolean = false;
  contextMenuPosition = { x: '0px', y: '0px' };


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
}
