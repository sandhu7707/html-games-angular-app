import { AfterViewInit, Component, NgZone, ViewChild, Input } from '@angular/core';
import { UserService } from '../services/id-service/user.service';
import { AdsService } from '../services/ads-service/ads.service';

@Component({
  selector: 'app-ad-banner',
  standalone: true,
  imports: [],
  templateUrl: './ad-banner.component.html',
  styleUrl: './ad-banner.component.css'
})
export class AdBannerComponent implements AfterViewInit{

  id!: string;
  ad: any;
  @Input() positionClass!: string

  @ViewChild("adContainer") adContainer!: any;

  constructor(private idService: UserService, private adsService: AdsService, private ngZone: NgZone){
    this.id = idService.id
  }

  ngAfterViewInit(): void {
    this.getAdAndAddToView();
  }

  getAdAndAddToView(){
    this.adContainer.nativeElement.innerHTML = this.adsService.getAd().outerHTML;
    this.ngZone.runOutsideAngular(() => setInterval(() => {
      this.ngZone.run(() => {
        this.adContainer.nativeElement.innerHTML = this.adsService.getAd().outerHTML;
      })
    }, 3000))
  }
}
