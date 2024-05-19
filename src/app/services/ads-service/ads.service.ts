import { Inject, Injectable, NgZone, Renderer2, RendererFactory2} from '@angular/core';
import { DOCUMENT } from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class AdsService {

  renderer: Renderer2;
 
  constructor(private ngZone: NgZone, private rendererFactory: RendererFactory2, @Inject(DOCUMENT) private document: Document) { 
    this.renderer = rendererFactory.createRenderer(null, null)
    this.initializeAds();
  }

  ads: any[] = [];
  adIdx: number = 0;

  initializeAds(){
    const div = this.document.createElement('div')
    div.innerHTML = 'ad1';
    this.ads.push(div.cloneNode(true))
    div.innerHTML = 'ad2';
    this.ads.push(div.cloneNode(true))
    div.innerHTML = 'ad3';
    this.ads.push(div.cloneNode(true))
    div.innerHTML = 'ad4';
    this.ads.push(div.cloneNode(true))
    div.innerHTML = 'ad5';
    this.ads.push(div.cloneNode(true))
    div.innerHTML = 'ad6';
    this.ads.push(div.cloneNode(true))
  }

  getAd(){
    if(this.adIdx === this.ads.length){
      this.adIdx = 0
    }
    return this.ads[this.adIdx++];
  }
}
