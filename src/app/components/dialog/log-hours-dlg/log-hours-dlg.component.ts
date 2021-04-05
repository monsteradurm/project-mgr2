import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'underscore';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, shareReplay, switchMap, take } from 'rxjs/operators';
import { Board } from 'src/app/models/BoardItem';
import { ScheduledItem } from 'src/app/models/Monday';
import { MondayService } from 'src/app/services/monday.service';
const _SCHEDULE_COLUMNS_ = ['Artist', 'Director', 'Timeline', 
          'Time Tracking', 'Status', 'ItemCode', 'Department', 'SubItems']

@Component({
  selector: 'app-log-hours-dlg',
  templateUrl: './log-hours-dlg.component.html',
  styleUrls: ['./log-hours-dlg.component.scss']
})
export class LogHoursDlgComponent implements OnInit {
  
  HourOptions = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  MinuteOptions = ['00', '15', '30', '45'];

  @Output() visbilityChanged = new EventEmitter<boolean>(false);
  @Input() Show: boolean = false;
  
  Boards$ = this.monday.Boards$;

  constructor(public monday: MondayService) { }
  Columns$ = this.monday.ColumnIdsFromTitles$(_SCHEDULE_COLUMNS_).pipe(take(1));
  Items$ = combineLatest([this.Boards$, this.Columns$]).pipe(
    switchMap(([boards, c_ids]) => {
      let b_ids = _.map(boards, b => b.id);
      return this.monday.ColumnValuesFromBoards$(b_ids, c_ids);
    }),
    map((items:any[]) => _.map(items, i => new ScheduledItem(i))),
    shareReplay(1)
  )
  ChangeVisibility(state) {
    console.log("HERE", state)
    this.visbilityChanged.next(state);
    this.NewLog = new NewHourLog(this);
  }
  ngOnInit(): void {
  }
  NewLog = new NewHourLog(this);
}

export class NewHourLog {
  item_id: string;
  date: string = moment().format('YYYY-MM-DD');
  hour: string = '09';
  minute: string = '00';
  half: string = 'AM';

  duration_hours: string = '01';
  duration_minutes: string = '00';
  private SelectedBoard = new BehaviorSubject<Board>(null);
  SelectedBoard$ = this.SelectedBoard.asObservable().pipe(shareReplay(1));

  private SelectedTask = new BehaviorSubject<ScheduledItem>(null);
  SelectedTask$ = this.SelectedTask.asObservable().pipe(shareReplay(1));

  IsRevision: boolean = false;

  monday: MondayService;
  Boards$: Observable<Board[]>;
  Items$: Observable<ScheduledItem[]>;
  SetBoard(b) { this.SelectedBoard.next(b); }
  SetTask(t) { this.SelectedTask.next(t); }
  
  Validate() {
    return true;
  }
  Submit() { 
    console.log(this, this.SelectedTask.value);
    if (this.Validate())
      this.monday.AddHoursLog(this); 
  }
  parent: LogHoursDlgComponent;

  constructor(parent: LogHoursDlgComponent) {
    this.parent = parent;
    this.monday = this.parent.monday;
    this.Boards$ = this.parent.Boards$.pipe(
      map(boards => _.filter(boards, b => b.name.indexOf('Subitems') < 0)),
      take(1)
    )

    this.Items$ = combineLatest([this.SelectedBoard$, this.parent.Items$]).pipe(
      map(([board, items]) => {
        return _.filter(items, i=> i.board.id == board.id);
      }),
      take(1)
    )
  }
}