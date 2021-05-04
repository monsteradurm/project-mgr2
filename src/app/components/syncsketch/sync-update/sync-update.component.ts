import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';

@Component({
  selector: 'app-sync-update',
  templateUrl: './sync-update.component.html',
  styleUrls: ['./sync-update.component.scss']
})
export class SyncUpdateComponent implements OnInit {

  constructor() { }
  _update;
  private Update = new BehaviorSubject<any>(null);
  Update$ = this.Update.asObservable().pipe(shareReplay(1))

  @Input() set update(u) { 
    this._update = u;
    this.Update.next(u);
  };

  @Input() Status;

  Updater$ = this.Update$.pipe(
    map(update =>
      update.publicUserInfo ? update.publicUserInfo : update.creator
    )
  )

  private lastUpdateOnly = new BehaviorSubject<boolean>(false);
  LastUpdateOnly$ = this.lastUpdateOnly.asObservable().pipe(shareReplay(1));

  _lastUpdateOnly;
  @Input() set LastUpdateOnly(l: boolean) { 
    this._lastUpdateOnly = l;
    this.lastUpdateOnly.next(false);
  }

  get LastUpdateOnly() { return this._lastUpdateOnly; }

  ngOnInit(): void {

  }

}
