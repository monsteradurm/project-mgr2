import { i18nMetaToJSDoc } from '@angular/compiler/src/render3/view/i18n/meta';
import { AfterViewInit, Directive, Renderer2, ElementRef,
    OnChanges, Input } from '@angular/core';
import 'tippy.js';
import tippy from 'tippy.js';

  @Directive({
    selector: '[addTippy]'
  })

  export class AddTippyDirective {
  
    constructor(private el: ElementRef) {
    }

    private _tippyText;
    get tippyText() { return this._tippyText; }
    private _tippy;
    @Input() set tippyText(c) {
        this._tippyText = c;
        
        this._tippy = tippy(this.el.nativeElement, {
            allowHTML: true,
            // offset: [0, -10],
            content: `<div style="border:solid 1px black;
background:white;color:black; border-radius:5px;padding:5px;">${this.tippyText}</div>`
        })
    }
  }