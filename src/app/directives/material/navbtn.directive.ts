import { Directive, Renderer2, ElementRef, OnInit, AfterViewInit, Input, HostListener } from '@angular/core';

const LABEL = 'mat-button'
const DEFAULT = 'black'

@Directive({
  selector: '[pmNavBtn]'
})
export class NavBtnDirective   implements OnInit{

_selected
@Input() set Selected(s) { 
    if (!s)
        return;

    this._selected = s; 

    if (this._title == this._selected) {
        let valid = this.find_elementsByClass(this.el.nativeElement, LABEL);
        console.log(valid)
    }
}
_title;
@Input() set Title(t) { 
    if (!t) return;

    this._title = t; 

    if (this._title == this._selected) {
        let valid = this.find_elementsByClass(this.el.nativeElement, LABEL);
        console.log(valid);
    }
}

get Title() { return this._title; }
get Selected() { return this._selected; }

  constructor(private renderer: Renderer2,
    private el: ElementRef) {
  }

  _primaryColor;
  get primaryColor() { return this._primaryColor; }

  @Input() set primaryColor(c) {
    this._primaryColor = c;
    //this.find_elementByClass(this.el.nativeElement, LABEL)
  }

  set_style(el, attr, val) {
    console.log(el, attr, val);
    this.renderer.setAttribute(el, 'style', `${attr}: ${val} !important`);
  }


  find_elementsByClass(el : Element, className, acc=[]) {
    let classes = el.className;

    console.log(el.children, className, acc)
    if (classes && classes.indexOf && classes.indexOf(className) >= 0)
      acc.push(el);

    if (el.children.length > 0)
      for(let i = 0; i < el.children.length; i++)
        acc = this.find_elementsByClass(el.children.item(i), className, acc);

    return acc;
  }

  ngOnInit() {
  }
}