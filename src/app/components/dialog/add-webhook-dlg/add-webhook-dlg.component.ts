import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-webhook-dlg',
  templateUrl: './add-webhook-dlg.component.html',
  styleUrls: ['./add-webhook-dlg.component.scss']
})
export class AddWebhookDlgComponent implements OnInit {

  constructor() { }
  Show: boolean  = false;
  Entry: WebhookEntry = new WebhookEntry();

  @Input() primaryColor;
  ngOnInit(): void {
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
