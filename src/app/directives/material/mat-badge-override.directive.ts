import { AfterViewInit, Directive, Renderer2, ElementRef,
    OnChanges, Input } from '@angular/core';
  
  const MAT_INK_BAR = 'mat-badge-content'
  @Directive({
    selector: '[pmBadgeOverride]'
  })
  export class MatBadgeOverrideDirective implements AfterViewInit, OnChanges {
  
    constructor(private renderer: Renderer2, private el: ElementRef) {
    }
    _primaryColor;
    get primaryColor() { return this._primaryColor; }
  
    _top;
    get top() { return this._top; }

    _fontSize;
    @Input() set fontSize(f) {
        this._fontSize = f;
        this.find_elementByClass(this.el.nativeElement, MAT_INK_BAR);
    }

    get fontSize() { return this._fontSize}
    @Input() set top(t) {
      this._top = t;
      this.find_elementByClass(this.el.nativeElement, MAT_INK_BAR);
    }

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
        
        else if (!color)
           color = 'black';

        let style = [];

        if (color)
           style.push(`background: ${color} !important;`)
        if (this._top) 
            style.push(`top: ${this._top} !important`);
        if (this._fontSize)
            style.push(`font-size: ${this._fontSize} !important`)
        
        this.renderer.setAttribute(el, 'style', style.join(";"));
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