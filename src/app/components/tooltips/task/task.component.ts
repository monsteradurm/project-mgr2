import { Component, Input, OnInit } from '@angular/core';
import { ScheduledItem } from 'src/app/models/Monday';
import * as _ from 'underscore';

@Component({
  selector: 'app-tasktooltip',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskTooltipComponent implements OnInit {

  constructor() { }
  private _Item: ScheduledItem;
  Department: string;
  Director: string;
  Artist: string;
  @Input() set Item(s: ScheduledItem) {
    this._Item = s;
    this.Artist = _.map(this._Item.artist, d=> d.text).join(", ");
    this.Department = _.map(this._Item.department, d=> d.text).join(", ");
    this.Director = _.map(this._Item.director, d=> d.text).join(", ");
  }

  get Item() { return this._Item; }

  ngOnInit(): void {
   
  }

}
