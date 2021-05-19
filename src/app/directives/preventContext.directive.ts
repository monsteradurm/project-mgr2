import { i18nMetaToJSDoc } from '@angular/compiler/src/render3/view/i18n/meta';
import { AfterViewInit, Directive, Renderer2, ElementRef,
    OnChanges, Input, HostListener } from '@angular/core';
import 'tippy.js';
import tippy from 'tippy.js';

  @Directive({
    selector: '[preventContext]'
  })

  export class PreventContextDirective {
  
    @HostListener('contextmenu', ['$event']) onContext(evt) {
        evt.preventDefault();
    }
    
    constructor(private el: ElementRef) {
    }
  }