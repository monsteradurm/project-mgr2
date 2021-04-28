import { AfterViewInit, ApplicationRef, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ChartType, getPackageForChart, GoogleChartComponent, ScriptLoaderService } from 'angular-google-charts';
import * as moment from 'moment';
import * as _ from 'underscore';
import { OverviewComponent } from '../overview.component';
import { shareReplay, tap, map, timestamp } from 'rxjs/operators';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { BoardItem } from 'src/app/models/BoardItem';
declare var gantt: any;

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

  @ViewChild('chart', { static: false, read: ElementRef }) chart: ElementRef;

  DoNotRender: boolean = false;

  _Width;
  @Input() set Width(w) {
    gantt.config.grid_width = w;
    this._Width = w;
  }

  get Width() {
    return this._Width;
  }

  @Output() _Expanded: string[] = [];
  @Input() set Expanded(e: string[]) {
    this._Expanded = e;
    this.LoadData();
  }

  get Expanded() { return this._Expanded; }

  ScrollTo(item) {
    let i = this.ProcessItem(item);
    gantt.showDate(i.start_date);
  }

  LoadData() {
    gantt.clearAll();

    if (gantt.$container) {
      gantt.addMarker({
        start_date: moment().toDate(),
        css: "today",
        text: "Today",
        //title: "Today: " + today.format('YYYY-MM-DD')
      });
    }
    this.SetViewRange(this.BoardItems);

    gantt.config.start_date = moment(this.MinViewValue).toDate();
    gantt.config.end_date = moment(this.MaxViewValue).toDate();


    gantt.config.min_column_width = 80;
    var zoomConfig = {
      minColumnWidth: 80,
      maxColumnWidth: 150,
      levels: [
        [
          {unit: "month", step: 1, format: "%M"},
          {
           unit: "year", step: 1, format: "%Y"
          }
        ],
        [
          { unit: "month", format: "%M %Y", step: 1 },
          {
            unit: "week", step: 1, format: function (date) {
              var dateToStr = gantt.date.date_to_str("%d %M");
              var endDate = gantt.date.add(date, 6, "day");
              return dateToStr(date) + " - " + dateToStr(endDate);
            }
          }
        ],
        [
          { unit: "month", format: "%M %Y", step: 1 },
          { unit: "day", format: "%d %M", step: 1 }
        ],
      ],
      startDate: gantt.config.start_date,
      endDate: gantt.config.end_date,
      trigger: "wheel",
      element: function () {
        return gantt.$root.querySelector(".gantt_task");
      }
    }

    gantt.ext.zoom.init(zoomConfig);
    gantt.message({
      text: "Use <b>ctrl + mousewheel</b> in order to zoom",
      expire: -1
    });

    let data = this.ProcessItems(this.BoardItems);
    this.Data = data;

    gantt.parse({
      data: data
    });
  }


  ProcessItems(items) {
    let result = []

    _.forEach(items, i => {
      result.push(this.ProcessItem(i))
      let isExpanded = this.Expanded.indexOf(i.id) > -1;

      if (isExpanded && i.subitems && i.subitems.length > 0) {
        _.forEach(i.subitems, s => {
          let sd = this.ProcessItem(s);
          result.push(sd);
        });
      }
    })
    return result;
  }
  get BoardItems() { return this._BoardItems; }
  _BoardItems;
  Data: any[] = [];

  @Input() set BoardItems(items) {
    this._BoardItems = items;
    this.LoadData();
  }

  ProcessItem(i) {
    let itemRange = this.GetItemRange(i);

    let start = itemRange[0];
    let end = itemRange[1];

    let hasArtist = i.artist && i.artist.length > 0;
    let hasTimeline = start && end;

    let isRevision = i.type != 'task';
    if (isRevision && !hasTimeline) {
      let parent = _.find(this.Data, b => b.subitem_ids && b.subitem_ids.indexOf(i.id) > -1);
      start = moment(parent.mStart)
    }
    else if (!hasTimeline)
      start = this.MinViewValue;

    let finished = this.QueryItemFinished(i);
    let color;
    let artist;

    artist = (hasArtist ?
      _.map(i.artist, a => a.text).join(". ") : 'Unassigned') + (hasTimeline ? '' : ', No Timeline')

    color = i.status && i.status.additional_info ? i.status.additional_info.color : 'black';
    if (!hasTimeline || isRevision) color = 'transparent';

    let result = {
      hasTimeline: hasTimeline, hasArtist: hasArtist, isRevision: isRevision, hasChildren: i.subitem_ids && i.subitem_ids.length > 0,
      isExpanded: isRevision && this.Expanded.indexOf(i) > -1, mStart: start, mEnd: end,
      id: i.id, text: artist, start_date: start.toDate(),
      duration: hasTimeline ? end.diff(start, 'days') : 5, finished: finished, subitem_ids: _.map(i.subitem_ids, i => i.toString()),
      row_height: 40, bar_height: 33, progress: 0, color: color, textColor: hasTimeline && !isRevision ? 'white' : 'black'
    };
    return result;
  }

  GetItemRange(i) {
    let timelineArr = i.timeline && i.timeline.text ? i.timeline.text.split(' - ') : null;
    let start = timelineArr ? moment(timelineArr[0]).startOf('day') : null;
    let end = timelineArr ? moment(timelineArr[1]).endOf('day') : null;
    return [start, end];
  }

  MinViewValue: moment.Moment;
  MaxViewValue: moment.Moment;

  QueryItemFinished(i) {

    if (!i.status || !i.status.text)
      return false;

    let s = i.status.text;

    return s.indexOf('Approved') > -1 || s.indexOf('Retasked') > -1;
  }

  SetViewRange(items) {
    let timelines = [];

    _.forEach(items, i => {
      timelines.push(this.GetItemRange(i));
      if (i.subitems && i.subitems.length > 0)
        i.subitems.forEach(s => timelines.push(this.GetItemRange(s)));
    });

    let startValues = _.filter(_.map(timelines, i => i[0]), i => i);
    let endValues = _.filter(_.map(timelines, i => i[1]), i => i);

    let start = startValues.length < 1 ? null : _.min(startValues);
    let end = endValues.length < 1 ? null : _.max(endValues);

    let today = moment();
    let range;

    if (!start && !end) {
      range = [moment(today).startOf('week').subtract(1, 'day'), moment(today).endOf('week').add(1, 'day')];
    }

    else if (start && end) {

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

    let remaining = _.filter(items, i => this.QueryItemFinished(i));
    if (remaining.length > 0)
      range[1] = moment();

    this.MinViewValue = moment(range[0]).subtract(1, 'week');
    this.MaxViewValue = moment(range[1]).add(1, 'week');
  }

  constructor(private parent: OverviewComponent, private app: ApplicationRef) { }

  differenceWorkDays(startDate: moment.Moment, endDate: moment.Moment): number {
    // + 1 cause diff returns the difference between two moments, in this case the day itself should be included.

    const totalDays: number = moment(endDate).diff(moment(startDate), 'days') + 1;
    const dayOfWeek = moment(startDate).isoWeekday();
    let totalWorkdays = 0;

    for (let i = dayOfWeek; i < totalDays + dayOfWeek; i++) {
      if (i % 7 !== 6 && i % 7 !== 0) {
        totalWorkdays++;
      }
    }
    return totalWorkdays;
  }


  subscriptions = [];
  ngOnInit(): void {
    this.parent.SetGanttView(this);
    gantt.plugins({
      marker: true
    });

    gantt.config.smart_scales = false;
    gantt.config.sort = false;
    gantt.config.scroll_on_click = true;
    gantt.config.date_format = "%Y-%m-%d";
    gantt.config.scale_height = 50;
    gantt.config.columns = [];
    gantt.config.readonly = true;
    gantt.config.show_unscheduled = true;
    gantt.config.prevent_default_scroll = true;
    gantt.config.scales = [
      { unit: "month", step: 1, format: "%F, %Y" },
      { unit: "day", step: 1, format: "%j, %D" }
    ];
    gantt.config.wheel_scroll_sensitivity = 0;
    gantt.config.show_tasks_outside_timescale = true;
    gantt.templates.rightside_text = function (start, end, task) {
      if (task.hasTimeline && !task.finished) {
        let today = moment();
        var overdue = moment().diff(task.mEnd, 'days');
        if (overdue < 0)
          return;

        var first = task.mEnd.clone().endOf('week'); // end of first week
        var last = today.clone().startOf('week'); // start of last week
        var days = last.diff(first, 'days') * 5 / 7; // this will always multiply of 7
        var wfirst = first.day() - task.mEnd.day(); // check first week
        if (task.mEnd.day() == 0) --wfirst; // -1 if start with sunday 
        var wlast = today.day() - last.day(); // check last week
        if (today.day() == 6) --wlast; // -1 if end with saturday
        overdue = wfirst + Math.floor(days) + wlast; // get the total

        if (overdue < 1) return;

        var text = `<b style="color:black;padding:2px 5px;margin-left:-10px;font-size:12px;border-bottom:solid 2px ${task.color}">${overdue} Days Overdue</b>`;
        return text;
      }
    };


    let today = moment();
    


    gantt.addTaskLayer((task) => {
      let container = document.getElementsByClassName('gantt-chart')[0] as HTMLElement;
      let color = task.color;
      let sizes;
      if (task.isRevision) {
        let parent = _.find(this.Data, d => d.subitem_ids && d.subitem_ids.indexOf(task.id) > -1);

        if (!parent || !parent.hasTimeline) return false;

        sizes = gantt.getTaskPosition(parent, parent.mStart.toDate(),
          parent.finished ? parent.mEnd.toDate() : moment().toDate());

        let offset = (1 + _.findIndex(parent.subitem_ids, i => i == task.id)) * 40;
        sizes.top += offset;
        color = parent.color;
      }
      else if (task.hasTimeline && !task.finished && task.mEnd) {
        let end = moment().toDate();
        sizes = gantt.getTaskPosition(task, task.mStart.toDate(), end);
      }
      if (!sizes)
        return false;

      let el = document.createElement('div');
      el.style.cssText =
        [
          "background:" + color,
          "left:" + sizes.left + 'px',
          "width:" + sizes.width + 'px',
          "top:" + sizes.top + 'px'].join(";");
      el.className = 'gantt-status-bg';
      return el;
    });

    gantt.templates.task_class = (start, end, task) => {
      if (task.hasTimeline) return '';

      if (!task.isRevision)
        return 'gantt_empty_task'

      let parent = _.find(this.Data, d => d.subitem_ids && d.subitem_ids.indexOf(task.id) > -1);
      let index = parent.subitem_ids.indexOf(task.id);


      return index == parent.subitem_ids.length - 1 ? 'gantt_empty_task last-revision' : 'gantt_empty_task';
    };

    gantt.templates.timeline_cell_class = function (task, date) {
      if (date.getDay() == 0 || date.getDay() == 6) {
        return "gantt-weekend";
      }
    };

    gantt.addMarker({
      start_date: moment().toDate(),
      css: "today",
      text: "Today",
      //title: "Today: " + today.format('YYYY-MM-DD')
    });
  }

  ngAfterViewInit() {
    gantt.init(this.chart.nativeElement);

  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  onError(evt) {

    let error = 'There was an error with the production data.\n'
    error += 'Please contact your Production Manager and/or Technical Director regarding.\n\n'
    error += evt.container.innerText;

    this.parent.parent.SetErrorMessage(error);
  }

  IterateChildren(el: Element, tagName: string, container: any[]): Element[] {
    if (el.children && el.children.length > 0) {
      for (let i = 0; i < el.children.length; i++) {
        let c = el.children.item(i);
        if (c.tagName == tagName)
          container.push(c);
        container = this.IterateChildren(c, tagName, container);
      }
    }
    return container;
  }

}

