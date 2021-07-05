import { Component, Input, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { BoxService } from 'src/app/services/box.service';
import { FirebaseService } from 'src/app/services/firebase.service';

const BOX_TRIGGERS = [
  "FOLDER.CREATED",
  "FOLDER.RENAMED",
  "FOLDER.RESTORED",
  "FOLDER.DELETED",
  "FOLDER.MOVED",
  "FOLDER.TRASHED"
]

const BOX_HOOK = "https://us-central1-pm-websocket.cloudfunctions.net/CacheBoxPaths"
@Component({
  selector: 'app-add-webhook-dlg',
  templateUrl: './add-webhook-dlg.component.html',
  styleUrls: ['./add-webhook-dlg.component.scss']
})
export class AddWebhookDlgComponent implements OnInit {

  constructor(private box: BoxService, private firebase: FirebaseService) { }
  Show: boolean  = false;
  Entry: WebhookEntry = new WebhookEntry();

  @Input() primaryColor;
  ngOnInit(): void {
  }

  onAddWebHook() {
    var target = {
      "id": this.Entry.folder_id,
      "type": "folder"
    };
    this.box.AddWebhook$(target, BOX_TRIGGERS, BOX_HOOK).pipe(take(1)).subscribe((result) => {
      console.log("BOX SERVICE WEBHOOK RESULT", result);

      this.firebase.AddBoxWebhook$(this.Entry.folder_id, this.Entry.name).then((fresult) => {
        console.log("FIREBASE SERVICE WEBHOOK RESULT", fresult);
      })
    })
  }

  OpenDialog() {
    this.Entry = new WebhookEntry();
    this.Show = true;
  }

  CloseDialog() {
    this.Show = false;
  }
}

class WebhookEntry {
  type: string = 'box';
  name: string;
  folder_id: string;
}
