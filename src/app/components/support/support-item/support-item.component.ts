import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { Issue } from 'src/app/models/Issues';
import { SupportComponent } from '../support.component';

@Component({
  selector: 'app-support-item',
  templateUrl: './support-item.component.html',
  styleUrls: ['./support-item.component.scss']
})
export class SupportItemComponent implements OnInit {
  contextMenuPosition = { x: '0px', y: '0px' };
  @ViewChild(MatMenu, {static:false}) contextMenu:MatMenu;
  @ViewChild(MatMenuTrigger, {static:false}) contextMenuTrigger: MatMenuTrigger;

  @HostListener('mouseover', ['$event']) onMouseOver(evt) {
      this.Hovering = true;
  }
  @HostListener('mouseout', ['$event']) onMouseLeave(evt) {
    if (!this.HasContext)
      this.Hovering = false;
  }

  @HostListener('contextmenu', ['$event']) onContextMenu(event) {
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenuTrigger.toggleMenu()
    this.HasContext = true;
    event.preventDefault();
  }

  constructor(private parent: SupportComponent) { }

  onContextClosed() {
    this.HasContext = false;
    this.Hovering = false;
  }

  onSetStatus(column) {
    this.parent.supportService.SetItemStatus(this.Item.board.id, this.Item, column);

    this.Item.status.color = column.color;
    this.Item.status.text = column.label;
    this.Item = JSON.parse(JSON.stringify(this.Item));
  }

  @Input() Item: Issue;
  Hovering: boolean = false;
  HasContext: boolean = false;

  StatusOptions$ = this.parent.StatusOptions$;
  ngOnInit(): void {
  }

}
