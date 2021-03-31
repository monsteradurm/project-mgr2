import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BoardItem, SubItem } from 'src/app/models/BoardItem';
import { OverviewBoarditemComponent } from '../overview-boarditem/overview-boarditem.component';
declare var LeaderLine: any;

@Component({
  selector: 'app-overview-subitem',
  templateUrl: './overview-subitem.component.html',
  styleUrls: ['./overview-subitem.component.scss']
})
export class OverviewSubitemComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(private parent: OverviewBoarditemComponent) { }
  @ViewChild('inplug', {static: true}) plug: ElementRef;
  line;

  _color: string = 'gray';
  _last: number;
  _index: number;

  @Input() set last(l: number) {
    this._last = l;
    this.SetLabelColor();
  }

  get last() { return this._last; }

  @Input() subitem: SubItem;

  @Input() set index(i: number) {
    this._index = i;
    this.SetLabelColor();
  }
  get index() { return this._index; }

  @Input() boarditemContainer: ElementRef;

  labelColor: string;

  SetLabelColor() {
    if (this.last == this.index)
      this.labelColor = this.color;
  }

  @Input() set color(c) {
    if (c)
      this._color = c;

    this.SetLabelColor();
  }

  get color() {
    return this._color;
  }

  ngAfterViewInit() {
    this.line = new LeaderLine(this.outplug.nativeElement, this.plug.nativeElement, 
      {
        startPlug: 'behind',
        path: 'grid',
        color: this.color,
        startSocket: 'bottom',
        endSocket: 'left',
        endPlugSize: 2,
        size: 1,
        //endSocketGravity: 10,
        startSocketGravity: 1
      });
  }

  get outplug() { return this.parent.plug; }

  ngOnInit(): void {
  }

  ngOnDestroy() { this.line.remove(); }
  
}
