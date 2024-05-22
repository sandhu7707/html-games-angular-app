import { EventEmitter, Injectable, Output } from '@angular/core';
import { UserService } from '../id-service/user.service';
import { RoomState } from './RoomState.type';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BroadcastService {

  userId!: string
  webSocket!: WebSocket

  _roomState = new Subject<any>
  currentRoomState!: any
  roomStateObservable = this._roomState.asObservable() 
  set roomState(roomState: any){
    this._roomState.next(roomState)
    this.currentRoomState = roomState
  }

  get roomState() {
    return this.currentRoomState
  }

  constructor( private userService: UserService) {
    if(userService.currentId){
      this.initChatService(userService.currentId)
    }
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
      console.log("sent message..........")
      this.sendMessage({type: 'login'})
    }

    this.webSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("message received, ", message)
      if(message.type === 'rooms-update'){
        this.roomState = message.data
      }
      console.log(this.currentRoomState)
    }
  }

  sendMessage(data: any){
    const msg = {userId: this.userId, ...data}
    this.webSocket.send(JSON.stringify(msg))
  }

  updateRoomState(gameId: string, gameRooms: any){
    this.roomState = {...this.currentRoomState, [gameId]: gameRooms}
    console.log("room state updated", this.currentRoomState)
    this.sendMessage(
      {
        type: 'rooms-update',
        key: gameId,
        value: gameRooms
      }
    )
  }

}
