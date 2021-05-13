import { Component, Input, OnInit } from '@angular/core';
import { CalendarItem, CalendarProperties } from 'src/app/models/Calendar';
import { ScheduledItem } from 'src/app/models/Monday';
import * as _ from 'underscore';

@Component({
  selector: 'app-tasktooltip',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskTooltipComponent implements OnInit {

  constructor() { }
  private _Item: any;
  tooltipId: string; 
  type: string = 'allocation';
  
  @Input() set Item(s: CalendarProperties) {
    this._Item = s;
    console.log(s);
  }

  get Item() { return this._Item; }

  ngOnInit(): void {
   
  }

}
