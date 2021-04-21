import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from "@angular/core";
@Directive({ selector: '[pmMouseWheel]' })
export class MouseWheelDirective {
  constructor(private el: ElementRef) { }
  @Input() mouseWheelY: boolean = true;
  @HostListener('mousewheel', ['$event']) onMouseWheelChrome(event: any) {
    this.mouseWheelFunc(event);
  }

  @HostListener('DOMMouseScroll', ['$event']) onMouseWheelFirefox(event: any) {
    this.mouseWheelFunc(event);
  }

  @HostListener('onmousewheel', ['$event']) onMouseWheelIE(event: any) {
    this.mouseWheelFunc(event);
  }

  mouseWheelFunc(event: any) {
    if (!event)
      event = window.event;

    let el = this.el.nativeElement as HTMLElement;
    if (this.mouseWheelY) {
      console.log()
    var delta = event.deltaY;
    let pos = window.pageYOffset;
    if(delta > 0) 
      el.scrollTo(0, pos - delta);
    }
  }
}