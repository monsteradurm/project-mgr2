import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Issue } from 'src/app/models/Issues';

@Component({
  selector: 'app-support-item',
  templateUrl: './support-item.component.html',
  styleUrls: ['./support-item.component.scss']
})
export class SupportItemComponent implements OnInit {

  @HostListener('mouseover', ['$event']) onMouseOver(evt) {
      this.Hovering = true;
  }
  @HostListener('mouseout', ['$event']) onMouseLeave(evt) {
    if (!this.HasContext)
      this.Hovering = false;
  }

  constructor() { }

  @Input() Item: Issue;
  Hovering: boolean = false;
  HasContext: boolean = false;
  ngOnInit(): void {
  }

}
