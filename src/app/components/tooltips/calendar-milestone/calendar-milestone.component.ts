import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { CalendarMilestone } from 'src/app/models/Calendar';

@Component({
  selector: 'app-calendar-milestone',
  templateUrl: './calendar-milestone.component.html',
  styleUrls: ['./calendar-milestone.component.scss']
})
export class CalendarMilestoneComponent implements OnInit {

  constructor(public element: ElementRef) { }
  @Input() Item: CalendarMilestone;
  get board() {
    if (!this.Item)
      return null;

    let board = this.Item.extendedProps.board;
    if (!board || board.indexOf('/') < 0)
      return board;

    return board.split('/')[0];
  }
  ngOnInit(): void {
    //this.Item.extendedProps.board
  }

}
