import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { BoxService } from 'src/app/services/box.service';
import { SystemComponent } from '../system.component';

@Component({
  selector: 'app-box-webhooks',
  templateUrl: './box-webhooks.component.html',
  styleUrls: ['./box-webhooks.component.scss']
})
export class BoxWebhooksComponent implements OnInit {

  constructor(private box: BoxService, private parent: SystemComponent) { }
  
  Webhooks$ = this.box.WebHooks$;

  ngOnInit(): void {
    //this.parent.navigation.SetPageTitles(["Box Webhooks"])

    //this.box.DeleteWebhook$("514664230").subscribe();

    /*this.Webhooks$.pipe(take(1)).subscribe(
      (hooks:any) => {
        if (hooks && hooks > 0)
          return;
        
        var target = {
          "id": "135380066515",
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
      });*/
      
  }

}
