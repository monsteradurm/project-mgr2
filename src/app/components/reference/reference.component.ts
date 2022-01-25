import { ResizeManager } from '@thalesrc/resize-manager';

import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { delay, map, retryWhen, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { BoxService } from 'src/app/services/box.service';

import * as _ from 'underscore';

declare var Box:any;

@Component({
  selector: 'app-reference',
  templateUrl: './reference.component.html',
  styleUrls: ['./reference.component.scss']
})
export class ReferenceComponent implements OnInit, OnDestroy, AfterViewInit {


  DrawerVisible: boolean = false;

  height = new BehaviorSubject<number>(0);
  Height$ = this.height.asObservable().pipe(
    map(h => h - 115)
  );

  fetching = new BehaviorSubject<boolean>(true);
  Fetching = this.fetching.asObservable().pipe(shareReplay(1))
  @Input() set Height(s) {
    this.height.next(s);
    console.log("HEIGHT", s)
  }
  
  @Output() requestHeight = new EventEmitter<boolean>();

  ngAfterViewInit() {
    this.requestHeight.next(true);
  }

  setFetching(val: boolean) {
    this.fetching.next(val);
  }

  @Input() primaryColor; 
  
  get Root() { return this._Root; }
  _Root:any;

  @Input() set Root(r:any) {
    console.log(r);
    this.root.next(r);
    this._Root = r;
  }

  onImageLoad() {
    this.requestHeight.next(true);
  }

  private root = new BehaviorSubject<any>(null);
  private _Root$ = this.root.asObservable();
  private onRefresh = new BehaviorSubject<boolean>(true);
  Refresh$ = this.onRefresh.asObservable();

  Root$ = combineLatest([this.Refresh$, this._Root$]).pipe(
    tap(t => this.setFetching(true)),
    map(([refresh, root]) => root ? root : null),
    shareReplay(1)
  )

  
  private current = new BehaviorSubject<string>(null);

  refresh() {
    this.onRefresh.next(true);
  }

  Current$ = combineLatest([this.Refresh$, this.current.asObservable(), this.Root$]).pipe(
    tap(t => this.setFetching(true)),
    switchMap(([refresh, current, root]) => current ? 
      this.box.GetFolder$(current) : 
      root ? 
      (root.item_collection ? of(root) : this.box.GetFolder$(root.id)) : of(null)),
    shareReplay(1),
  )

  Contents$ = this.Current$.pipe(
    map((contents:any) => {
      if (!contents) throw ('Could not find Box Contents');
      return contents.item_collection.entries;
    }),
    tap(t => {
      console.log("CONTENTS", t);
      this.setFetching(false);
    })
  )

  Folders = [];
  Folders$ = this.Contents$.pipe(
    map(contents => _.filter(contents, c => c.type == 'folder'))
  )

  BoxPreview = new Box.Preview();
  BoxUploader = new Box.ContentUploader();

  Files = [];

  Files$ = this.Contents$.pipe(
    map(contents => _.filter(contents, c=> c.type == 'file')),
    map(contents => {
      _.forEach(contents, c => c['Thumbnail$'] = 
      this.box.Thumbnail$(c).pipe(
        retryWhen(errors => {
          console.log("Thumbnail is not ready --> Retrying")
          return errors.pipe(delay(3000), take(10))
        }),
      ))
      return contents;
    })
  )

  
  SetCurrent(id) {
    this.current.next(id);
  }

  constructor(private box: BoxService, private el: ElementRef) { }

  
  subscriptions = [];
  ngOnInit(): void {
    
    this.subscriptions.push(
      this.Folders$.subscribe(contents => this.Folders = contents)
    );

    this.subscriptions.push(
      this.Files$.subscribe(contents => this.Files = contents)
    );

    this.BoxUploader.addListener('complete', (evt) => { 
      this.refresh(); }
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

  ShowPreview: string = null;

  ClearPreview() {
    this.ShowPreview=null;
    this.PreviewName = null;
  }

  Download() {
   this.BoxPreview.download();
  }

  ShowUploader:boolean = false;
  ShowUploadContainer() {
    this.DrawerVisible = true;
    combineLatest([this.box.Token$, this.Current$]).pipe(take(1)).subscribe(
      ([token, current]) => {
      this.BoxUploader.show(current['id'], token, {
        container: '.upload-container'
      });
    });
  }

  PreviewName;
  onSelect(id, name) {
    this.PreviewName = name;
    this.box.Token$.pipe(take(1)).subscribe(token => {
      this.ShowPreview = id;
      let preview = this.BoxPreview.show(id, token, {
        container: '.preview-container',
        showDownload: true,
      });
      
    })
  }

}
