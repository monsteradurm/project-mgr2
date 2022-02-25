import { Directive, Input, OnInit, ElementRef, OnChanges } from '@angular/core';
import tippy from 'tippy.js';

@Directive({
  /* tslint:disable-next-line */
  selector: '[addTippy]'
})
export class AddTippyDirective implements OnInit, OnChanges {

  @Input('tippyText') public tippyText: string = "Some Text";

  constructor(private el: ElementRef) {
    this.el = el;
  }

  updateTippy() {
    var el = this.el.nativeElement as HTMLElement;
    el.setAttribute('data-tippy-contnet', this.tippyText);
    tippy(this.el.nativeElement, {
      allowHTML: true,
      // offset: [0, -10],
      content: `<div style="border:solid 1px black;
      background:white;color:black; border-radius:5px;padding:5px;">${this.tippyText}</div>`
        })
  }

  public ngOnInit() {
    this.updateTippy();
  }

  public ngOnChanges() {
    this.updateTippy();
  }
}