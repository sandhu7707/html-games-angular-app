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

  gameRoom!: WebSocket
  updateGameRoom!: (room: any) => void
  removePlayer!: (gameId: string, roomId: number) => void
  
  startGameRoom(gameId: string, roomId: number, updateRoom: (room: any) => void){
    console.log(this.gameRoom, "starting room")
    this.gameRoom = new WebSocket(`${environment.serverWsUrl}game/${gameId}/room/${roomId}`)
    this.gameRoom.onmessage = (event) => updateRoom(JSON.parse(event.data))
    this.gameRoom.onopen = (event) => {
      console.log("sending game room init")
      this.gameRoom.send(JSON.stringify({type: 'init', userId: this.userId}))
    }
    this.updateGameRoom = (room: any) => this.gameRoom.send(JSON.stringify({type: 'update', data: room, userId: this.userId}))
    this.removePlayer = (room:any) => this.gameRoom.send(JSON.stringify({type: 'remove-player', data: {gameId: gameId, roomId: roomId}, userId: this.userId}))
    return this.updateGameRoom
  }

  closeGameRoom(){
    this.gameRoom.send(JSON.stringify({type: 'init', data: -1}))
  }

  updateGameRoomListener(gameId: string, roomId: number, updateRoom: (room: any) => void){
    // if(!this.gameRoom){
    //   return this.startGameRoom(gameId, roomId, updateRoom)
    // }
    this.gameRoom.onmessage = (event) => updateRoom(JSON.parse(event.data))
    this.gameRoom.send(JSON.stringify({type: 'get-update'}))
    return this.updateGameRoom
  }
}
