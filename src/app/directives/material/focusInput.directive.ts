import { Directive, Renderer2, ElementRef, OnInit, AfterViewInit, Input, HostListener } from '@angular/core';

const LABEL = 'mat-form-field-ripple'
const DEFAULT = 'rgba(0, 0, 0, 0.2)'

@Directive({
  selector: '[pmFocusInput]'
})
export class FocusInputDirective   implements OnInit{

  constructor(private renderer: Renderer2,
    private el: ElementRef) {
  }

  @HostListener('focusin') onFocus(){
    let el = this.el.nativeElement as Element;
    let els = this.find_elementsByClass(this.el.nativeElement, LABEL);
    els.forEach((e) => this.set_style(e, 'background-color', this.primaryColor));
  }

  @HostListener('focusout') onFocusOut(){
    let el = this.el.nativeElement as Element;
    let els = this.find_elementsByClass(this.el.nativeElement, LABEL);
    els.forEach((e) => this.set_style(e, 'background-color', DEFAULT));
  }

  last;
  _primaryColor;
  get primaryColor() { return this._primaryColor; }

  @Input() set primaryColor(c) {
    this._primaryColor = c;
    //this.find_elementByClass(this.el.nativeElement, LABEL)
  }

  set_style(el, attr, val) {
    this.renderer.setAttribute(el, 'style', `${attr}: ${val} !important`);
  }


  find_elementsByClass(el : Element, className, acc=[]) {
    let classes = el.className;

    if (classes && classes.indexOf && classes.indexOf(className) >= 0)
      acc.push(el);

    if (el.children.length > 0)
      for(let i = 0; i < el.children.length; i++)
        acc = this.find_elementsByClass(el.children.item(i), className, acc);

    return acc;
  }

  ngOnInit() {
    this.onFocus();
    this.onFocusOut();
  }
}