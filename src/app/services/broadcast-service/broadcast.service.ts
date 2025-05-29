import { Injectable } from '@angular/core';
import { UserService } from '../user-service/user.service';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

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
    userService.idObservable.subscribe((id) => {
      if(id){
        this.initChatService(id)
    }
  })
  }

  initChatService(id: string) {
    if(!id && this.webSocket){
      this.webSocket.close()
    }
    this.userId = id
    this.webSocket = new WebSocket(environment.serverWsUrl)
    this.webSocket.onopen = (event) => {
      this.sendMessage({type: 'login'})
    }

    this.webSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if(message.type === 'rooms-update'){
        this.roomState = message.data
      }
      console.log(this.currentRoomState)
    }
  }

  sendMessage(data: any, onReply: null |((message: any, defaultHandler: undefined | ((message: any) => any)) => void) = null){
    const msg = {userId: this.userId, ...data}
    if(onReply){
      const originalHandler = this.webSocket.onmessage
      this.webSocket.onmessage = (event: any) => {
        console.log("before onReply..")
        onReply(event, originalHandler?.bind(this.webSocket))
        console.log("after onReply..")
        this.webSocket.onmessage = originalHandler
        console.log(this.webSocket.onmessage)
      }
    }
    
    this.webSocket.send(JSON.stringify(msg))
  }

  createRoom(gameId: string, room: any, onCreate: (message: any, defaultHandler: undefined | ((message: any) => any)) => void){
    this.sendMessage({
      type: 'create-room',
      gameId: gameId,
      room: room,
      playerInfo: {
        id: this.userId,
        name: this.userService.currentNickname,
        ready: false
      }
    },
    onCreate)
  }

  leaveRoom(gameId: string, roomId: number){
    this.sendMessage({
      type: 'leave-room',
      gameId: gameId,
      roomId: roomId
    })    
  }

  logout(){
    this.sendMessage({type: 'logout'})
  }

  joinRoom(gameId: string, roomId: string){
    this.sendMessage({
      type: 'join-room',
      gameId: gameId,
      roomId: roomId,
      playerInfo: {
        id: this.userId,
        name: this.userService.currentNickname,
        ready: false
      }
    })    
  }

}
