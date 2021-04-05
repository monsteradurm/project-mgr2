import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-view-task-dlg',
  templateUrl: './view-task-dlg.component.html',
  styleUrls: ['./view-task-dlg.component.scss']
})
export class ViewTaskDlgComponent implements OnInit {
  @Input() Show: boolean = true;
  @Output() VisibilityChanged = new EventEmitter<boolean>(false);

  @Input() primaryColors; 
  constructor() { }

  ngOnInit(): void {
  }

}
