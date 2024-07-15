import { Component, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FormComponentComponent } from './form-component/form-component.component';
import { ProductsComponent } from './products/products.component';
import { ChatWidgetComponent } from './chat-widget/chat-widget.component';
import { Subscription } from 'rxjs';
import { MessageServiceService } from './services/message-service/message-service.service';
import { UserService } from './services/id-service/user.service';
import { AdBannerComponent } from './ad-banner/ad-banner.component';
import { CommonModule, Location } from '@angular/common';
import { BroadcastService } from './services/broadcast-service/broadcast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, FormComponentComponent, RouterLink, RouterLinkActive, ProductsComponent, ChatWidgetComponent, AdBannerComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent{
  title = 'hello-world';
  name = "";
  navStatus: number[] = new Array(3).fill(0)

  @ViewChild("appChatWidget") chatWidget!: ChatWidgetComponent;

  unreadMessageCount: number = 0;
  unreadMessageCountSubscription: Subscription;

  constructor(private messageService: MessageServiceService, protected userService: UserService, private chatService: BroadcastService, private location: Location, private router: Router){
    this.unreadMessageCountSubscription = messageService.messageCountObservable.subscribe(
      unreadMessageCount => this.unreadMessageCount = unreadMessageCount
    );

    console.log("rendered")

    location.onUrlChange((url, state) => {
      
      console.log(url)
      this.navStatus = new Array(3).fill(0)
      if(url.includes("home")){
        this.navStatus[0] = 1
      }
      else if(url.includes("add-game")){
        this.navStatus[1] = 1
      }
      else if(url.includes("profile")){
        this.navStatus[2] = 1
      }
    })

  }

  toggleChatWidgetVisibility(){
    this.chatWidget.isVisible = !this.chatWidget.isVisible;
    if(this.chatWidget.isVisible){
      this.messageService.setUnreadMessageCount(0)
    }
  }

  changeName(e: any){
    this.userService.name = e.target.value
  }

  
  some(e: any){
    this.chatService.sendMessage({type: 'state-update',"key":"broadcast","value":"broadcast"})
  }

}
