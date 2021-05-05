import { Component, Input, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ScheduledItem } from 'src/app/models/Monday';
import { HomeComponent } from '../home.component';
import * as _ from 'underscore';

@Component({
  selector: 'app-itemchart',
  templateUrl: './itemchart.component.html',
  styleUrls: ['./itemchart.component.scss']
})
export class ItemchartComponent implements OnInit {

  constructor(private parent: HomeComponent) { }

  Items$ = this.parent.MyFilteredItems$;
  ChartData$ = this.Items$.pipe(
    map(items => _.map(items, i => i.status)
  ),
    map(status => _.map(status, s => s  && s.additional_info ? 
      {label: s.additional_info.label, color: s.additional_info.color } : 
      {label: 'Not Started', color: 'black' }
      )),
    map(status => _.groupBy(status, s => s.label)),
    map(groups => {
      let labels = Object.keys(groups);
      let data = _.map(labels, l=> groups[l].length);
      let backgroundColor = _.map(labels, l=> groups[l][0].color);
      return {labels, datasets: [{ data, backgroundColor }] }
    }),
  )

  ngOnInit(): void {
  }

}
