import { AfterViewInit, ApplicationRef, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { ChartType, getPackageForChart, GoogleChartComponent, ScriptLoaderService } from 'angular-google-charts';
import * as moment from 'moment';
import * as _ from 'underscore';
import { OverviewComponent } from '../overview.component';
import { shareReplay, tap, map, timestamp } from 'rxjs/operators';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { BoardItem } from 'src/app/models/BoardItem';
import {gantt } from "dhtmlx-gantt";

const _TASKNAME_ = 0;
const _ARTIST_ = 1;
const _STARTDATE_ = 2;
const _ENDDATE_ = 3;
const NULL_MOMENT = moment(0).toDate();

@Component({
  selector: 'app-overview-gantt',
  templateUrl: './overview-gantt.component.html',
  styleUrls: ['./overview-gantt.component.scss'], 
})
export class OverviewGanttComponent implements OnInit, AfterViewInit {
  
  scroll_state;
  clicked = false;
  original_mouse_position;

  @HostListener('mousedown', ['$event']) onMouseDown(event) {
    event.preventDefault(); 
    this.scroll_state = gantt.getScrollState().x;
	  this.original_mouse_position = event.clientX;
    this.clicked = true;
  }

  @HostListener('mousemove', ['$event']) onMouseMove(e) {
    if (!this.clicked)
    return;

    var scroll_value = this.scroll_state + this.original_mouse_position - e.clientX
    gantt.scrollTo(scroll_value, null);
  }
  @HostListener('touchmove', ['$event'])
  @HostListener('window:mouseup', ['$event']) onMouseUp(event) {
    event.preventDefault(); 
    this.clicked = false;
  }

  @ViewChild('chart', {static: false, read: ElementRef}) chart: ElementRef;

  DoNotRender: boolean = false;

  private boarditems = new BehaviorSubject<BoardItem[]>(null);
  BoardItems$ = this.boarditems.asObservable().pipe(shareReplay(1));


  _Width;
  @Input() set Width(w) {
    gantt.config.grid_width = w;
    this._Width = w;
  }

  get Width() {
    return this._Width;
  }

  ScrollTo(item) {
    let i = this.ProcessItem(item);
    gantt.showDate(i.start_date);
  }

  ProcessItems(items) {
    let result = []

    _.forEach(items, i=> {
      result.push(this.ProcessItem(i))
      if (i.subitems && i.subitems.length > 0) {
        _.forEach(i.subitems, s => {
          let sd = this.ProcessItem(s);
          result.push(sd);
        });
      }
    })
    return result;
  }
  @Input() set BoardItems(items) { 
    this.boarditems.next(items); 


    gantt.clearAll(); 

    this.SetViewRange(items);
    let data = this.ProcessItems(items);

    gantt.templates.task_class = (start, end, task) => {
      if (task.text == 'Unassigned, No Timeline')
        return 'gantt_empty_task'
      return '';
    };
    gantt.config.smart_scales = false;
    gantt.config.sort = false;
    gantt.config.scroll_on_click = true;
    gantt.config.date_format = "%Y-%m-%d";
    gantt.config.scale_height = 50;
    gantt.config.columns = [];
    gantt.config.readonly = true;
    gantt.config.show_unscheduled = true;
    gantt.config.scales = [
      {unit: "month", step: 1, format: "%F, %Y"},
      {unit: "day", step: 1, format: "%j, %D"}
    ];

			gantt.config.show_tasks_outside_timescale = true;
      gantt.templates.timeline_cell_class = function(task,date){
        if(date.getDay()==0||date.getDay()==6){ 
            return "gantt-weekend" ;
        }
      };
			gantt.config.start_date = moment(this.MinViewValue).toDate();
			gantt.config.end_date = moment(this.MaxViewValue).toDate();

    
    gantt.parse({
      data: data
    });
    
  }

  ProcessItem(i) {
    let itemRange = this.GetItemRange(i);

    let start = itemRange[0];
    let end = itemRange[1];
  
    let hasArtist = i.artist && i.artist.length > 0;
    let hasTimeline = start && end;
    let color;
    let artist;

    artist = (hasArtist ?
        _.map(i.artist, a => a.text).join(". ") : 'Unassigned') + (hasTimeline ? '' : ', No Timeline')

    color = i.status && i.status.additional_info ? i.status.additional_info.color : 'black';
    if (!hasArtist)
      color = 'transparent';

    let result = { id: i.id, text: artist, start_date: hasTimeline ? start.toDate() : moment(this.MinViewValue).toDate(), 
      duration: hasTimeline ? end.diff(start, 'days') : 5, 
      row_height: 40, bar_height: 33, progress: 0, color: color, textColor: hasArtist && hasTimeline? 'white' : 'black'} ;
    return  result;
  }
    /*
  Data$ = this.BoardItems$.pipe(
    map(items => {
      if (items.length < 1) {
        this.DoNotRender = true;
        return [];
      }
      else 
        this.DoNotRender = false;
      return items;
    }),
    map(items => {
      let result = [];
      this.SetViewRange(items);
      this.colors = this.GetItemColors(items);
      this.SetOptions(this.MinViewValue, this.MaxViewValue, this.colors)
      items.forEach(item => {
        let d = this.ProcessItem(item, result.length + 1);
        result.push(d);

        if (item.subitems && item.subitems.length > 0) {

          _.forEach(item.subitems, s => {
            s.element = item.element;
            s.task = s.name;
            
            let sd = this.ProcessItem(s, result.length + 1);
            result.push(sd);
          })
        }
      })
      return result;
    }),
    shareReplay(1)
  )*/
  /*
  ProcessItem(i, index) {
    let itemRange = this.GetItemRange(i);

    let start = itemRange[0] ? itemRange[0] : this.MinViewValue;
    let end = itemRange[1] ? itemRange[1] : this.MaxViewValue;

    if (!itemRange[0] && !itemRange[1]) {
      let middle = this.MinViewValue.add(
        this.MaxViewValue.diff(this.MinViewValue, 'days') * 0.5, 'days');
      
      itemRange = [middle, null];
    }
  
    let artist = (i.artist && i.artist.length > 0 ?
      _.map(i.artist, a => a.text).join(". ") : 'Unassigned') + (!itemRange[0] || !itemRange[1] ? ', No Timeline' : '');

    return [
      index, artist, this.GetHtmlTooltip(i.name, artist, itemRange, i), start, itemRange[1] ? end : start, 
    ];
  }

  GetHtmlTooltip(name, artist, itemRange, i) {
    let html = `<div style="font-family:Delius;font-size:12px;">
        <div style="border-bottom:solid 1px black;padding:5px;display:flex;font-weight:bold">
          <div style="font-weight:500;padding: 0px 10px;float:left">${i.element} / ${i.task}</div>`

      if (artist)
        html +=  `<div style="font-weight:500;padding: 0px 10px;float:right;margin-left:30px">${artist}</div>
        </div>`
    else
      html += `
          <div style="margin-left:10px;padding-left:5px;font-style:italic">Unassigned</div>
        </div>`

        
    if (itemRange[0] && itemRange[1]) {
      html+= `<div style="margin-left:10px;padding-left:5px;margin-top:10px">
                <span style="font-weight:500;margin-right:10px;width:80px">Starting</span>`;
      html += `<span style="text-align:right;width:70px">${itemRange[0].format('ddd MMM yyyy')}</span></div>`
      html+= `<div style="margin-left:10px;padding-left:5px"><span style="font-weight:500;margin-right:10px;width:80px">Ending</span>`;
      html += `<span style="text-align:right;width:70px">${itemRange[1].format('ddd MMM yyyy')}</span></div>`
    }

    html += `
        </div>`
    return html;
  }
  
  GetItemColors(items) {
    let colors = [];
    _.forEach(items, i => {
      let col = i.status && i.status.additional_info ? i.status.additional_info.color : 'black';
      colors.push(col);

      if (!i.subitems || i.subitems.length < 1)
        return;
      
      _.forEach(i.subitems, s=> colors.push('gray'));
      colors[colors.length - 1] = col;
    });

    return colors;
  }
  */
  GetItemRange(i) {
    let timelineArr = i.timeline && i.timeline.text ? i.timeline.text.split(' - ') : null;
    let start = timelineArr ? moment(timelineArr[0]).startOf('day') : null;
    let end = timelineArr ? moment(timelineArr[1]).endOf('day') : null;
    return [start, end];
  }

  MinViewValue : moment.Moment;
  MaxViewValue : moment.Moment;

  SetViewRange(items) {
    let timelines = [];
    
    _.forEach(items, i => {
      timelines.push(this.GetItemRange(i));
      if (i.subitems && i.subitems.length > 0)
        i.subitems.forEach(s => timelines.push(this.GetItemRange(s)));
    });

    let startValues = _.filter(_.map(timelines, i => i[0]), i=> i);
    let endValues = _.filter(_.map(timelines, i => i[1]), i => i);

    let start = startValues.length < 1 ? null : _.min(startValues);
    let end = endValues.length < 1 ? null : _.max(endValues);
 
    let today = moment();
    let range;

    if (!start && !end) {
      range = [moment(today).startOf('week').subtract(1, 'day'), moment(today).endOf('week').add(1, 'day')];
    }

    else if (start && end ) {
 
      range = [moment(start).startOf('week'), moment(end).endOf('week')];
    }
    else if (start && !end && start < today) {
      range = [moment(start).startOf('week'), moment(today).endOf('week')];
    }

    else if (start && !end && start > today) {
      range = [moment(start).startOf('week'), moment(start).add(1, 'week').endOf('week')];
    }

    else if (!start && end && end > today) {
      range = [moment(today).startOf('week'), moment(end).endOf('week')];
    }

    this.MinViewValue = moment(range[0]).subtract(1, 'week');
    this.MaxViewValue = moment(range[1]).add(1, 'week');
  }
  colors = [];

  Options;
  /*
  SetOptions(minValue, maxValue, colors) {
    this.Options = {

        allowHtml: true,
        tooltip: { isHtml: true },
        hAxis: { 
          minValue: minValue.subtract(1, 'days') - 0.1,
          maxValue: maxValue,
          format: 'MMM dd',
        },
        colors: colors,
        explorer: {
          maxZoomOut:2,
          keepInBounds: true
        },
        timeline: { 
          
          colorByRowLabel: true,
          showRowLabels: false,
          barHeight: 25,
          rowLabelStyle: {
            fontName: 'Delius',
            fontSize: 12,
            color: 'white',
          },
        },  
    }
  }*/

  constructor(private parent: OverviewComponent, private app: ApplicationRef) { }

  chartType = ChartType.Timeline;
  width=800;
  height=100;
  
  columns = [
            { label: 'Task', type: 'string' },
            { label: 'Resources', type: 'string' },
            { type: 'string', role: 'tooltip', p: {html: true}},
            { label: 'Start', type: 'date' },
            { label: 'End', type: 'date' },
            ]


  subscriptions = [];
  ngOnInit(): void {
    this.parent.SetGanttView(this);

    this.subscriptions.push(
      this.parent.UpdatedBoardItems$.subscribe(items => {
        if (items) {
          this.boarditems.next(items);
        }
      })
    )
  }

  ngAfterViewInit() {
    gantt.init(this.chart.nativeElement);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
  /*
  NoBars: boolean = false;
  OnLeave(evt) {
    this.GetRows().forEach(r => this.SetRowAttributes(r, this.NoBars ? '50' : '150'));
  }
  OnOver(evt) {
    this.GetRows().forEach(r => this.SetRowAttributes(r, this.NoBars ? '50' : '150'));
  }
  */
  onError(evt) {

    let error = 'There was an error with the production data.\n'
    error += 'Please contact your Production Manager and/or Technical Director regarding.\n\n'
    error += evt.container.innerText;
    
    this.parent.parent.SetErrorMessage(error);
  }
  /*
  HasNoItems() {
    return _.filter(this._BoardItems, i => i.timeline).length < 1
  }*/

  SetRowAttributes(r: [Element, Element], NullTextPosition='0') {
    let bar = r[0];
    let text = r[1];

    if (text) {
      text.setAttribute('font-family', 'Delius')
      text.setAttribute('font-size', '12px')
      text.setAttribute('font-weight', '500');
      if (text.getAttribute('text-anchor') == 'end' || text.getAttribute('x') == NullTextPosition)
        //text.setAttribute('text-anchor', 'start')
        if (bar)
          text.setAttribute('fill', 'black') //bar.getAttribute('fill'));
        else 
          text.setAttribute('fill', 'black');
      if (text.innerHTML.indexOf('Unassigned') > -1) {
        text.setAttribute('font-style', 'italic');
        text.setAttribute('fill', 'gray')
      }
      if (text.innerHTML.indexOf('Timeline') > -1) {
          text.setAttribute('x', NullTextPosition);
          text.setAttribute('fill', 'gray')
          
      }
          /*
          if (bar)
            text.setAttribute('fill', bar.getAttribute('fill'));
          else text.setAttribute('fill', 'black');*?
      */
      if (text.getAttribute('text-anchor') == 'start' && text.getAttribute('x') != NullTextPosition)
        text.setAttribute('fill', 'white');
    }
    if (bar) {
      if (parseFloat(bar.getAttribute('x')) > 0) {
        bar.setAttribute('rx', '4');
        bar.setAttribute('ry', '4');
        bar.setAttribute('stroke', 'black')
        bar.setAttribute('stroke-width', '0.5');
      };

      if (parseFloat(bar.getAttribute('width')) <= 3)
        bar.setAttribute('opacity', '0')
    }
  
  }
  
  /*
  GetRows() {
    return _.zip(
      _.filter(this.FindElement('rect'), t=> t && parseFloat(t.getAttribute('x')) != 0), 
      _.filter(this.FindElement('text'), t=> t.getAttribute('text-anchor') != 'middle')
    );
  }

  OnReady(evt) {
    this.GetRows().forEach(r => this.SetRowAttributes(r, this.NoBars ? '40' : '150'));
    
  }*/
  /*
  FindElement(tagName) : Element[] {
    return this.IterateChildren(this.container.nativeElement, tagName, []);
  }
  */

  IterateChildren(el:Element, tagName:string, container: any[]): Element[] {
    if (el.children && el.children.length > 0) {
      for(let i = 0; i < el.children.length; i++) {
        let c = el.children.item(i);
        if (c.tagName == tagName)
          container.push(c);
        container = this.IterateChildren(c, tagName, container);
      }
    }
    return container;
  }

}

