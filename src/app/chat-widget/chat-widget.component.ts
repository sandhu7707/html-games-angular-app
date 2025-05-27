import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageServiceService } from '../services/message-service/message-service.service';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [MatButton],
  templateUrl: './chat-widget.component.html',
  styleUrl: './chat-widget.component.css'
})
export class ChatWidgetComponent {

  isVisible:boolean = false;


  unreadMessageCount: number = 0;
  unreadMessageCountSubscription: Subscription;

  constructor(private messageService: MessageServiceService){
    this.unreadMessageCountSubscription = messageService.messageCountObservable.subscribe(
      unreadMessageCount => this.unreadMessageCount = unreadMessageCount
    );
  }

  incrementMessageCount() {
    this.messageService.setUnreadMessageCount(this.unreadMessageCount + 1)
  }

  
  get hidden() {
    return !this.isVisible
  }

}
