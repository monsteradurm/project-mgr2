import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, Renderer2, ViewChildren } from '@angular/core';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { delay, map, retryWhen, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { BoxService } from 'src/app/services/box.service';
import { NavigationService } from 'src/app/services/navigation.service';
import * as _ from 'underscore';

declare var Box:any;

@Component({
  selector: 'app-reference',
  templateUrl: './reference.component.html',
  styleUrls: ['./reference.component.scss']
})
export class ReferenceComponent implements OnInit, OnDestroy {
  @ViewChildren('errorContainer', {}) errorContainer: ElementRef;
  constructor(
    private renderer: Renderer2,
    private navigation: NavigationService,
    private box: BoxService) { 
  }

  @Output() Fetching: boolean = true;
  @Output() onClose = new EventEmitter<boolean>(false);
  @Input() primaryColor; 

  _Show;
  @Input() set Show(s: boolean) {
    this._Show = s;
  }

  get Show() { 
    return this._Show;
  }
  get Root() { return this._Root; }
  _Root:string;

  @Input() set Root(r:string) {
    this.rootId.next(r);
    this._Root = r;
  
  }

  private rootId = new BehaviorSubject<string>(null);
  private RootId$ = this.rootId.asObservable();

  private onRefresh = new BehaviorSubject<boolean>(null);
  Refresh$ = this.onRefresh.asObservable();

  private Root$ = combineLatest([this.Refresh$, this.RootId$]).pipe(
    switchMap(([refresh, root]) => root ? 
      this.box.GetFolder$(root) : of(null)),
      tap(t => {
        if (!t && this.errorContainer) {
          console.log("HERE");
          this.renderer.addClass(this.errorContainer.nativeElement, 'load');
        }
      }),
      shareReplay(1)
  )


  Title$ = this.Root$.pipe(
    map(root => root ? root.path_collection.entries : null),
    map(entries => entries ? entries[entries.length - 1] : null),
    map(parent => parent ? parent.name : null)
  )
  private current = new BehaviorSubject<string>(null);

  refresh() {
    this.onRefresh.next(true);
  }

  Current$ = combineLatest([this.Refresh$, this.current.asObservable()]).pipe(
    tap(t => this.Fetching = true),
    switchMap(([refresh, current]) => current ? 
      this.box.GetFolder$(current) : this.Root$),
    shareReplay(1)
  )

  Contents$ = this.Current$.pipe(
    map(contents => {
      if (!contents) return null

      if (!contents.item_collection) return null;

      if (contents.item_collection.total_count < 1) return [];

      return contents.item_collection.entries;
    }),
    tap(t => {
      if (t)
      this.Fetching = false
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

  Path$ = combineLatest([this.RootId$, this.Current$]).pipe(
    map(([root, current]) => {

      if (!root || !current || root == current.id) return [];

      if (!current || !current.path_collection || !current.path_collection.entries ||
        current.path_collection.total_count < 1)
        return [];

      let entries = current.path_collection.entries;
  
      let index = _.findIndex(entries, e => e.id == root);

      return entries.splice(index, entries.length - index);
    }),
    shareReplay(1)
  )

  SetCurrent(id) {
    this.current.next(id);
  }

  CurrentPath$ = this.Path$.pipe(
    map(pathArr => _.map(pathArr, p => p.name).join("/"))
  )

  Closing() { 
    this.navigation.ReferenceFolder$ = null;
    this.Root = null;
    this.rootId.next(null);
    this.current.next(null);
    this.onClose.next(true);
  }

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
    
    combineLatest([this.box.Token$, this.Current$]).pipe(take(1)).subscribe(
      ([token, current]) => {
      this.BoxUploader.show(current.id, token, {
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
