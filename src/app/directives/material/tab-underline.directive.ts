import { AfterViewInit, Directive, Renderer2, ElementRef,
    OnChanges, Input } from '@angular/core';
  
  const MAT_INK_BAR = 'mat-ink-bar'
  @Directive({
    selector: '[pmTabUnderline]'
  })
  export class TabUnderlineDirective implements AfterViewInit, OnChanges {
  
    constructor(private renderer: Renderer2, private el: ElementRef) {
    }
    _primaryColor;
    get primaryColor() { return this._primaryColor; }
  
    @Input() set primaryColor(c) {
      this._primaryColor = c;
      this.find_elementByClass(this.el.nativeElement, MAT_INK_BAR)
    }
  
    find_elementByClass(el : Element, className) {

      let classes = el.className;
      if (classes && classes.indexOf && classes.indexOf(className) >= 0) {
        let color = this.primaryColor;
        if (color['changingThisBreaksApplicationSecurity'])
          color = color['changingThisBreaksApplicationSecurity'];
  
        this.renderer.setAttribute(el, 'style', `background: ${color} !important`);
      }
  
      else
        if (el.children.length > 0)
          for(let i = 0; i < el.children.length; i++)
            this.find_elementByClass(el.children.item(i), className);
    }
    ngAfterViewInit() {
      this.find_elementByClass(this.el.nativeElement, MAT_INK_BAR);
    }
  
    ngOnChanges() {
      this.find_elementByClass(this.el.nativeElement, MAT_INK_BAR);
    }
  }