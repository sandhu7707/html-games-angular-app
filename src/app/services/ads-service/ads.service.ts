import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdsService {

  constructor() { 
    this.initializeAds();
  }

  ads: any[] = [];
  adIdx: number = 0;

  initializeAds(){
    this.ads.push(
      `<div>ad1</div>`,
      `<div>ad2</div>`,
      `<div>ad3</div>`,
      `<div>ad4</div>`,
      `<div>ad5</div>`,
      `<div>ad6</div>`,
      `<div>ad7</div>`,
    )
  }

  getAd(){
    if(this.adIdx === this.ads.length){
      this.adIdx = 0
    }
    return this.ads[this.adIdx++];
  }
}
