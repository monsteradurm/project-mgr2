import { Component, OnInit, ViewChild } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map, shareReplay, take, tap } from 'rxjs/operators';
import { BoxService } from 'src/app/services/box.service';
import { SystemComponent } from '../system.component';

import * as _ from 'underscore';
import { AddWebhookDlgComponent } from '../../dialog/add-webhook-dlg/add-webhook-dlg.component';

@Component({
  selector: 'app-box-webhooks',
  templateUrl: './box-webhooks.component.html',
  styleUrls: ['./box-webhooks.component.scss']
})
export class BoxWebhooksComponent implements OnInit {

  @ViewChild(AddWebhookDlgComponent, { static: false}) AddWebhookDlg: AddWebhookDlgComponent;

  constructor(private box: BoxService, 
    private parent: SystemComponent) { }
  
  AllWebhooks$ = combineLatest([this.box.WebHooks$, this.parent.firebase.BoxWebhooks$]).pipe(shareReplay(1));
  
  get primaryColor() {
    return this.parent.primaryColor;
  }

  Webhooks$ = this.AllWebhooks$.pipe(
    tap(t => console.log("HERE", t)),
    map(([box, firebase]) => {
      let valid = _.filter(box, b => _.find(firebase, f => f.id == b.id));
      return valid;
    })
  )

  OnAddWebhook() {
    this.AddWebhookDlg.OpenDialog();
  }

  InvalidWebhooks$ = this.AllWebhooks$.pipe(
    map(([box, firebase]) => {

      ///box webhook not stored in firebase
      let invalidbox = _.filter(box, b => !_.find(firebase, f => f.id == b.id));

      // box webhook stored in firebase but not recognized in box
      let invalidfb = _.filter(firebase, f=> !_.find(box, b => b.id == f.id));

      return invalidbox.concat(invalidfb);
    })
  )

  ngOnInit(): void {
    //this.parent.navigation.SetPageTitles(["Box Webhooks"])

    //this.box.DeleteWebhook$("514664230").subscribe();
    /*
    this.Webhooks$.pipe(take(1)).subscribe(
      (hooks:any) => {
        if (hooks && hooks > 0)
          return;
        
        var target = {
          "id": "136031968653",
          "type": "folder"
        };
        var triggers = [
          "FOLDER.CREATED",
          "FOLDER.RENAMED",
          "FOLDER.RESTORED",
          "FOLDER.DELETED",
          "FOLDER.MOVED",
          "FOLDER.TRASHED"
        ]
        var address = "https://us-central1-pm-websocket.cloudfunctions.net/CacheBoxPaths";
        this.box.AddWebhook$(target, triggers, address).pipe(take(1)).subscribe((result) => console.log("POSTED", result));
      });
      */
  }

}
