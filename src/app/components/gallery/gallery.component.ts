import { Component, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { BoxService } from 'src/app/services/box.service';
import { NavigationService } from 'src/app/services/navigation.service';
import * as _ from 'underscore';

declare var Box:any;

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit, OnDestroy {

  @Output() primaryColor;

  private galleryId = new BehaviorSubject<string>(null);
  Gallery$ = this.galleryId.asObservable().pipe(shareReplay(1));

  Contents$ = this.Gallery$.pipe(
    switchMap(id => 
      id ? this.box.GetFolder$(id) : of('NULL ID')),
    map((gallery:any) => {
      if (gallery == 'NULL ID') return of(null);

      if (!gallery || !gallery.item_collection)
        return of([]);

      let items =  _.filter(gallery.item_collection.entries, i => i.type =='file');
      items.forEach(i => { i['Thumbnail$'] = this.box.Thumbnail$(i) });

      return items;
    }),
    shareReplay(1)
  )

  subscriptions = [];
  constructor(private box: BoxService,
    private navigation: NavigationService) { 

  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.navigation.NavigationParameters$.subscribe(
        (params:any) => {
          if (params && params.path) {
            this.navigation.SetPageTitles(params.path.split('%2F'))
          }

          if (params && params.folder) {
            this.galleryId.next(params.folder);
          }
        }
      )
    )
    this.subscriptions.push(
      this.navigation.PrimaryColor$.subscribe(c => this.primaryColor = c)
     )
  }
  ShowPreview: string = null;
  BoxPreview = new Box.Preview();

  ClearPreview() {
    this.ShowPreview=null;
    this.navigation.PopPageTitle();
  }

  Download() {
   this.BoxPreview.download();
  }

  onSelect(id, name) {
    this.navigation.AddPageTitle(name);
    this.box.Token$.pipe(take(1)).subscribe(token => {
      this.ShowPreview = id;
      let preview = this.BoxPreview.show(id, token, {
        container: '.preview-container',
        showDownload: true,
      
      });
      
    })
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
