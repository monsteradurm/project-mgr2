import { Component, Input, OnInit } from '@angular/core';
import { OverviewComponent } from '../overview.component';

@Component({
  selector: 'app-element',
  templateUrl: './element.component.html',
  styleUrls: ['./element.component.scss']
})
export class ElementComponent implements OnInit {

  @Input() Element;
  @Input() Task;
  @Input() Department;
  
  private projectComponent = this.parent.parent; 
  constructor(private parent: OverviewComponent) { }

  ngOnInit(): void {
  }

}
