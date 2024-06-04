import { EventEmitter, Injectable, Output } from '@angular/core';
import { UserService } from '../id-service/user.service';
import { RoomState } from './RoomState.type';
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
      console.log("closed chat ws")
    }
    this.userId = id
    this.webSocket = new WebSocket(environment.serverWsUrl)
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

  gameRoom!: WebSocket
  
  startGameRoom(gameId: string, roomId: number, updateRoom: (room: any) => void){
    console.log(this.gameRoom, "starting room")
    this.gameRoom = new WebSocket(`${environment.serverWsUrl}game/${gameId}/room/${roomId}`)
    this.gameRoom.onmessage = (event) => updateRoom(JSON.parse(event.data))
    this.gameRoom.onopen = (event) => {
      console.log("sending game room init")
      this.gameRoom.send(JSON.stringify({type: 'init', userId: this.userId}))
    }

    return (room: any) => {
      console.log("update room ......")
      this.gameRoom.send(JSON.stringify({type: 'update', data: room, userId: this.userId}))
    }
  }

  closeGameRoom(){
    this.gameRoom.send(JSON.stringify({type: 'init', data: -1}))
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
