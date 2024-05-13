import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageServiceService {

  private unreadMessageCount = new Subject<number>;

  messageCountObservable = this.unreadMessageCount.asObservable()

  setUnreadMessageCount(count: number){
    this.unreadMessageCount.next(count);
  }
}
