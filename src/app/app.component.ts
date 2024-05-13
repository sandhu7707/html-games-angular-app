import { Component, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FormComponentComponent } from './form-component/form-component.component';
import { ProductsComponent } from './products/products.component';
import { ChatWidgetComponent } from './chat-widget/chat-widget.component';
import { Subscription } from 'rxjs';
import { MessageServiceService } from './services/message-service/message-service.service';
import { IdServiceService } from './services/id-service/id-service.service';
import { AdBannerComponent } from './ad-banner/ad-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, FormComponentComponent, RouterLink, RouterLinkActive, ProductsComponent, ChatWidgetComponent, AdBannerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent{
  title = 'hello-world';
  id: string;
  name = "";

  @ViewChild("appChatWidget") chatWidget!: ChatWidgetComponent;

  unreadMessageCount: number = 0;
  unreadMessageCountSubscription: Subscription;

  constructor(private messageService: MessageServiceService, private idService: IdServiceService){
    this.unreadMessageCountSubscription = messageService.messageCountObservable.subscribe(
      unreadMessageCount => this.unreadMessageCount = unreadMessageCount
    );

    idService.nameObservable.subscribe(name => this.name = name)
    this.id = idService.id
  }

  toggleChatWidgetVisibility(){
    this.chatWidget.isVisible = !this.chatWidget.isVisible;
    if(this.chatWidget.isVisible){
      this.messageService.setUnreadMessageCount(0)
    }
  }

  changeName(e: any){
    this.idService.name = e.target.value
  }
}
