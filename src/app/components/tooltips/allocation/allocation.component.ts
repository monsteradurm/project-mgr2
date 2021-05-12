import { Component, ElementRef, OnInit } from '@angular/core';
import { CalendarItem } from 'src/app/models/Calendar';

@Component({
  selector: 'app-allocation',
  templateUrl: './allocation.component.html',
  styleUrls: ['./allocation.component.scss']
})
export class AllocationComponent implements OnInit {

  constructor(public element: ElementRef) { }

  Event: CalendarItem;
  height: number = 67;
  primaryColor: string;
  ngOnInit(): void {
  }

}
