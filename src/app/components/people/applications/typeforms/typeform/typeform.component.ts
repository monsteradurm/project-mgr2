import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { BehaviorSubject } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { TypeformsComponent } from '../typeforms.component';

@Component({
  selector: 'app-typeform',
  templateUrl: './typeform.component.html',
  styleUrls: ['./typeform.component.scss']
})
export class TypeformComponent implements OnInit {
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
   event.preventDefault();
   return;
    /*
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenuTrigger.toggleMenu()
    this.HasContext = true;
    event.preventDefault(); */
  }


  onContextClosed() {
    this.HasContext = false;
    this.Hovering = false;
  }

  constructor(private parent: TypeformsComponent) { }

  
  private form = new BehaviorSubject<any>(null);
  Form$ = this.form.asObservable().pipe(shareReplay(1));

  @Input() set Form(s: any) {
    this.form.next(s);
  }

  Responses$ = this.Form$.pipe(
    map(form => form.id),
    switchMap(id => this.parent.typeform.Form$(id)),
    tap(t => console.log("FORM", t))
  )
  get primaryColor() { return this.parent.primaryColor; }

  NavigateTo(url) {
    window.open(url, "_blank");
  }

  ngOnInit(): void {
  }

}
