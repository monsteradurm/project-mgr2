import { i18nMetaToJSDoc } from '@angular/compiler/src/render3/view/i18n/meta';
import { AfterViewInit, Directive, Renderer2, ElementRef,
    OnChanges, Input, HostListener } from '@angular/core';

  @Directive({
    selector: '[pmStyleOverride]'
  })

  export class StyleOverrideDirective implements AfterViewInit {
  
    constructor(private renderer: Renderer2, private el: ElementRef) {
    }
    @HostListener('focusin') onFocus(){ 
      let el = this.el.nativeElement as Element;
      if (!this._focusStyleOverrides) return;
      this.SetStyles(this._focusStyleOverrides);
    }
    @HostListener('focusout') onFocusOut() { 
      let el = this.el.nativeElement as Element;
      if (!this._focusStyleOverrides) return;
      this.SetStyles(this._styleOverrides);
    }
    @HostListener('mouseover') onMouseOver() { 
      let el = this.el.nativeElement as Element;
      if (!this._hoverStyleOverrides) return;
      this.SetStyles(this._hoverStyleOverrides);

    }
    @HostListener('mouseleave') onMouseLeave() { 
      let el = this.el.nativeElement as Element;
      if (!this._hoverStyleOverrides) return;
      this.SetStyles(this._styleOverrides);
    }

    _hoverStyleOverrides;
    get hoverStyleOverrides() { return this._hoverStyleOverrides; }

    _focusStyleOverrides;
    get focusStyleOverrides() { return this._focusStyleOverrides; }

    _styleOverrides;
    get styleOverrides() { return this._styleOverrides; }

    @Input() set styleOverrides(c) {
        this._styleOverrides = c;

       if (c && c.length && c.length > 0)
        this.SetStyles(this.styleOverrides);  
    }

    @Input() set focusStyleOverrides(s) { this._focusStyleOverrides = s; }
    @Input() set hoverStyleOverrides(s) { this._hoverStyleOverrides = s; }

    SetStyles(overs: StyleOverride[]) {
        overs.forEach(s => {
          try {
            let c = s.className
            if (c == 'base')
              this.set_styleAttributes(this.el.nativeElement, s);
            else 
              this.find_elementByClass(this.el.nativeElement, s);
          }
          catch(e) { console.log(e); } 
        })
    }

    set_styleAttributes(el : Element, s: StyleOverride) {
      if (s.override['changingThisBreaksApplicationSecurity'])
        s.override = s.override['changingThisBreaksApplicationSecurity'];

      this.renderer.setAttribute(el, 'style', `${s.style}: ${s.override} !important`);
    }
    find_elementByClass(el : Element, s: StyleOverride) {
      let classes = el.className;
      if (classes && classes.indexOf && classes.indexOf(s.className) >= 0) 
        this.set_styleAttributes(el, s);
      else
        if (el.children.length > 0)
          for(let i = 0; i < el.children.length; i++)
            this.find_elementByClass(el.children.item(i), s);
    }

    ngAfterViewInit() {
      if (this.styleOverrides)
        this.SetStyles(this.styleOverrides);

      
    }
  }

  export class StyleOverride {
    className: string;
    style: string;
    override: string;
  }