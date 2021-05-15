import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { shareReplay, take } from 'rxjs/operators';

const _IFRAMEALLOW_ = 'gifgpciglhhpmeefjdmlpboipkibhbjg';
const _IGNOREXFRAME_ = 'gleekbfjekiniecknbkamfmkohkpodhe';

@Injectable({
  providedIn: 'root'
})
export class ChromeService {


  private _isChrome = new BehaviorSubject<boolean>(null);
  IsChrome$ = this._isChrome.asObservable().pipe(shareReplay(1));

  constructor(private http: HttpClient) {
    this._isChrome.next(this.isChrome());
  }

  detectBrowser(agent) {
    switch (true) {
      case agent.indexOf("edge") > -1: return "MS Edge (EdgeHtml)";
      case agent.indexOf("edg") > -1: return "MS Edge Chromium";
      case agent.indexOf("opr") > -1 && !!window['opr']: return "opera";
      case agent.indexOf("chrome") > -1 && !!window['chrome']: return "chrome";
      case agent.indexOf("trident") > -1: return "Internet Explorer";
      case agent.indexOf("firefox") > -1: return "firefox";
      case agent.indexOf("safari") > -1: return "safari";
      default: return "other";
    }
  }

  isChrome() {
    let browser = this.detectBrowser(window.navigator.userAgent.toLowerCase());
    return browser == 'chrome';
  }
}
