import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ScheduledItem } from 'src/app/models/Monday';
import { HomeComponent } from '../home.component';
import * as _ from 'underscore';

@Component({
  selector: 'app-itemchart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './itemchart.component.html',
  styleUrls: ['./itemchart.component.scss']
})
export class ItemchartComponent implements OnInit {

  constructor(private parent: HomeComponent) { }

  Items$ = this.parent.MyFilteredItems$;
  ChartData$ = this.Items$.pipe(
    map(items => _.map(items, i => i.status)
    ),
    map(status => _.map(status, s => s && s.additional_info ?
      { label: s.additional_info.label, color: s.additional_info.color } :
      { label: 'Not Started', color: 'black' }
    )),
    map(status => _.groupBy(status, s => s.label)),
    map(groups => {
      let labels = Object.keys(groups);
      let data = _.map(labels, l => groups[l].length);
      let backgroundColor = _.map(labels, l => groups[l][0].color);
      return {
        labels, datasets: [{
          data,
          backgroundColor

        }]
      }
    }),
  )

  Options = {
    cutoutPercentage: 40,
    hoverBorderWidth: 1,
    circumference: Math.PI,
    rotation: Math.PI,
    legend: {
      display: true,
      labels: {
        fontSize: 13,
        fontFamily: 'Delius',
        fontWeight: 'bold',
        boxWidth: 13,
      },
    },
    layout: {    
      padding: {
        top: 0,
      }
    },
    elements: {
      arc: {
        borderWidth: 1,
        hoverBorderWidth: 1,
        hoverBorderColor: 'black',
        hoverBackgroundColor: 'lightgray',
        borderColor: 'white',
      }
    },
    tooltips: {
      backgroundColor: 'white',
      caretSize: 0,
      borderColor: 'black',
      borderWidth: '1',
      xPadding: 12,
      yPadding: 10,
      bodyFontSize: 13,
      bodyFontFamily: 'Delius',
      callbacks: {
        label: function (tooltipItem, data) {
          var label = data.labels[tooltipItem.index];
          let count = data.datasets[0].data[tooltipItem.index];
          var total = data.datasets[0].data.reduce((s, f) => s + f)
          return `  ${label}:  ${count} Items,  ${count / total * 100}%`;
        },
        labelTextColor: (context) => {
          return 'black';
        }
      }
    }
  }

  ngOnInit(): void {
  }

}
