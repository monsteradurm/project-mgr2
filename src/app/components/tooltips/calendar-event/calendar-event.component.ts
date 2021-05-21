import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { CalendarItem } from 'src/app/models/Calendar';

@Component({
  selector: 'app-calendar-event',
  templateUrl: './calendar-event.component.html',
  styleUrls: ['./calendar-event.component.scss']
})
export class CalendarEventComponent implements OnInit {

  constructor(public element: ElementRef) { }
  @Input() Item: CalendarItem;
  ngOnInit(): void {
    
  }

}
