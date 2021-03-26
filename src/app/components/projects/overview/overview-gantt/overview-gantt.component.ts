import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChartType, getPackageForChart, ScriptLoaderService } from 'angular-google-charts';
import * as moment from 'moment';
import * as _ from 'underscore';

const _TASKNAME_ = 0;
const _ARTIST_ = 1;
const _STARTDATE_ = 2;
const _ENDDATE_ = 3;

@Component({
  selector: 'app-overview-gantt',
  templateUrl: './overview-gantt.component.html',
  styleUrls: ['./overview-gantt.component.scss']
})
export class OverviewGanttComponent implements OnInit {
  constructor() { }

  chartType = ChartType.Gantt;
  width=800;
  height=100;

  data = [
    ['Phil Faily / Design Character', 'Walker, Rachael',
      new Date(2020, 2, 22), new Date(2020, 5, 20), null, 50, null],
    ['Anita Brakes / Design Character', 'Maldonado, William',
      new Date(2020, 3, 22), new Date(2020, 4, 20), null, 30, null],
    ['Chad / Design Character', 'Battams, George',
      new Date(2020, 5, 22), new Date(2020, 6, 20), null, 40, null],
    ['Goat / Design Character', 'Battams, George',
      new Date(2020, 2, 22), new Date(2020, 5, 20), null, 80, null],
    ['Bird / Design Character', 'Walker, Rachael',
      new Date(2020, 0, 22), new Date(2020, 1, 20), null, 20, null],
  ]

  columns = [
            { label: 'Task', type: 'string' },
            { label: 'Resources', type: 'string' },
            { label: 'Start', type: 'date' },
            { label: 'End', type: 'date' },
            { label: 'Duration', type: 'number' },
            { label: 'Percentage Complete', type: 'number' },
            { label: 'Dependencies', type: 'string' }
          ]

    minValue
  
    options = {
      allowHtml: true,
      hAxis: { 
        gridlines: 
        { count: 20, 
          color: '#f00'
        },
        format: 'MMM dd'
      },
      //colors: ['#000', '#000', '#ec8f6e', '#000', '#000'],
      gantt: { 
        barHeight: 25,
        labelStyle: {
          fontName: 'Roboto',
          fontSize: 12,
          color: 'red',
        },
        palette: [
          {
            "color": "#cccccc",
            "dark": "#333333",
            "light": "#eeeeee"
          }
        ]
      },
    
       
    }
    

  onResized(evt) {
    this.width = window.screen.width - 600 - 100 - 20;
    this.height = ( this.data.length * 40 ) + 520
  }

  MinimumStart() {
    let t = _.min(this.data, d => d[_STARTDATE_]);
    if (!t || t.length < _STARTDATE_ + 1)
      return null;

    return t[_STARTDATE_]
  }

  MaximumEnd() {
    let t = _.max(this.data, d=> d[_ENDDATE_]);
    if (!t || t.length < _ENDDATE_ + 1)
      return null;

    return t[_ENDDATE_];
  }

  get defaultStartRange() { 
    return moment(this.MinimumStart()).startOf('week');
  }

  get defaultEndRange() {
    return moment(this.MaximumEnd()).endOf('week')
  }

  get defaultMajorGridLines() {
    return this.defaultEndRange.diff(this.defaultStartRange, 'weeks');
  }

  get defaultMinorGridLines() {
    return this.defaultEndRange.diff(this.defaultStartRange, 'days');
  }

  get defaultTicks() {
    let ticks = [];
    let start = this.defaultStartRange;
    let count = this.defaultEndRange.diff(this.defaultStartRange, 'days');

    for(let i = 0; i < count; i++) {
      ticks.push(start.add(i, 'weeks').toDate())
    }
    return ticks;
  }
  ngOnInit(): void {

  }

  onError(evt) {
    console.log("ERROR", evt);
  }
  onReady(evt) {
    console.log("HERE", evt);
  }

}
