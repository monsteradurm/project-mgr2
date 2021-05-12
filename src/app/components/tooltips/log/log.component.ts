import { Component, ElementRef, OnInit } from '@angular/core';
import { CalendarLog } from 'src/app/models/Calendar';
import { TimeEntry } from 'src/app/models/TimeLog';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss']
})
export class LogComponent implements OnInit {

  constructor(public element: ElementRef) { }
  Entry: CalendarLog;

  ngOnInit(): void {
  
  }

}
