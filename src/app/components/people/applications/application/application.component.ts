import { Component, OnInit, Input, ViewChild, HostListener } from '@angular/core';
import { Application, ApplicationsComponent } from '../applications.component';
import { BehaviorSubject } from 'rxjs';
import { shareReplay, take } from 'rxjs/operators';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss']
})
export class ApplicationComponent implements OnInit {

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

  constructor(private parent: ApplicationsComponent) { }

  private applicant = new BehaviorSubject<Application>(null);
  Application$ = this.applicant.asObservable().pipe(shareReplay(1));

  @Input() set Applicant(s: Application) {

    this.applicant.next(s);
  }
  get primaryColor() { return this.parent.primaryColor; }

  ngOnInit(): void {
  }

  RetrieveFile(answer:any) {
    this.Application$.pipe(take(1)).subscribe(app => {
      this.parent.RetrieveFile(answer, app.response_id);
    });
    
  }
}
