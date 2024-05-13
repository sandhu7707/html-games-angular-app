import { Component, NgZone } from '@angular/core';
import { IdServiceService } from '../services/id-service/id-service.service';
import { AdsService } from '../services/ads-service/ads.service';

@Component({
  selector: 'app-ad-banner',
  standalone: true,
  imports: [],
  templateUrl: './ad-banner.component.html',
  styleUrl: './ad-banner.component.css'
})
export class AdBannerComponent {

  id!: string;
  ad: any;

  constructor(private idService: IdServiceService, private adsService: AdsService, private ngZone: NgZone){
    this.id = idService.id  
    this.getAd();
  }

  getAd(){
    this.ad = this.adsService.getAd();
    this.ngZone.runOutsideAngular(() => setInterval(() => {
      this.ngZone.run(() => this.ad = this.adsService.getAd())
    }, 3000))
  }
}
