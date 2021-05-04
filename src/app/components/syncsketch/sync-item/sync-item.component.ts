import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { SyncSketchService } from 'src/app/services/sync-sketch.service';

@Component({
  selector: 'app-sync-item',
  templateUrl: './sync-item.component.html',
  styleUrls: ['./sync-item.component.scss']
})
export class SyncItemComponent implements OnInit {

  constructor(private syncSketch: SyncSketchService) { }
  @Input() ShowViewHint: boolean = true;
  private Item = new BehaviorSubject<any>(null);
  Item$ = this.Item.asObservable().pipe(shareReplay(1));

  private lastUpdateOnly = new BehaviorSubject<boolean>(false);
  LastUpdateOnly$ = this.lastUpdateOnly.asObservable().pipe(shareReplay(1));

  _item;
  @Input() set item(s:any) {
    if (Array.isArray(s) && s.length > 1)
      s = s[s.length - 1];

    this._item = s;
    this.Item.next(s);
  };
  get item() { return this._item; }

  @Input() Status;

  _lastUpdateOnly;
  @Input() set LastUpdateOnly(l: boolean) { 
    this._lastUpdateOnly = l;
    this.lastUpdateOnly.next(false);
  }

  onClick() {
    this.Updates$.pipe(take(1)).subscribe(updates => {
      if (updates.length < 1) {
        this.NewTab(`${this.item.reviewURL}#/${this.item.id}`);
      }
      else {
        let u = updates[updates.length - 1];
        this.NewTab(`${this.item.reviewURL}#/${this.item.id}/${u.id}`);
      }
    })
  }

  get LastUpdateOnly() { return this._lastUpdateOnly; }

  private AllUpdates$ = this.Item$.pipe(
    switchMap(item => item ? this.syncSketch.Updates$(item.id) : of([])),
    shareReplay(1),
  )

  Updates$ = combineLatest([this.AllUpdates$, this.LastUpdateOnly$]).pipe(
    map(([updates, lastUpdateOnly]) => {
      if (!updates || updates.length < 1)
        return [];

      else if (!lastUpdateOnly)
        return updates;
    
      return [updates[updates.length - 1]];
    }),
    distinctUntilChanged((a, b) => JSON.stringify(a) == JSON.stringify(b)),
  )

  ngOnInit(): void {
  }

  NewTab(url) {
    window.open(url, "_blank");
  }
}
