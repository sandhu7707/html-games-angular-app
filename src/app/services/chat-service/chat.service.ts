import { Injectable } from '@angular/core';
import { UserService } from '../id-service/user.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  userId!: string
  webSocket!: WebSocket

  constructor( private userService: UserService) {
    userService.idObservable.subscribe((id) => this.initChatService(id))
   }

  initChatService(id: string) {
    if(!id && this.webSocket){
      this.webSocket.close()
      console.log("closed chat ws")
    }

    this.userId = id
    this.webSocket = new WebSocket("ws://localhost:3333/")
    this.webSocket.onopen = (event) => {
      const userIdObj = {uid: "userId"}
      this.sendMessage(null)
    }

    this.webSocket.onmessage = (event) => {
      console.log("message received, ", event.data)
    }
  }

  sendMessage(data: any){
    const msg = {id: this.userId, ...data}
    this.webSocket.send(msg.toString())
  }

}
