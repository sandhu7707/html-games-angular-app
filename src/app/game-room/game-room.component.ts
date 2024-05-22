import { Component, Input, AfterContentInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BroadcastService } from '../services/broadcast-service/broadcast.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from '../services/id-service/user.service';
import { read } from 'fs';

@Component({
  selector: 'app-game-room',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-room.component.html',
  styleUrl: './game-room.component.css'
})
export class GameRoomComponent implements AfterContentInit{

  @Input() gameId!: string
  @Input() roomId!: string
  hostName!: string
  dealerName!: string
  room!: any
  broadcastServiceSubscription: Subscription
  ready!: boolean
  userId!: string

  constructor(private broadcastService: BroadcastService, private router: Router, private userService: UserService) {
    this.userId = userService.id
    this.broadcastServiceSubscription = broadcastService.roomStateObservable.subscribe((roomState) => {
      this.setRoom(roomState)
    })
  }

  setRoom(roomState: any){
    if(!this.gameId){
      return
    }
    if(roomState[this.gameId]){
      const room = roomState[this.gameId].filter((room: any) => room.roomId === parseInt(this.roomId))[0]
      if(room){
        this.room = room
        this.hostName = room.players.find((player: any) => player.id === room.hostId).name
        this.ready = room.players.find((player: any) => player.id === this.userId).ready
        this.dealerName = room.players.find((player: any) => player.id === room.dealerId).name
        console.log(room)
        return
      }
    }
  
    console.log("doesn't exist", this.roomId, roomState)
    alert('this room doesn\'t exist anymore')
    this.broadcastServiceSubscription.unsubscribe()
    this.router.navigate(['/products'])

  }

  ngAfterContentInit(): void {
    console.log(this.roomId, this.broadcastService.currentRoomState)
    if(this.broadcastService.currentRoomState){
      this.setRoom(this.broadcastService.currentRoomState)
    }
  }

  readyButtonLabel(){
    return this.ready ? "Not Ready" : "Ready"
  }

  toggleReady(){
    const gameRooms = Object.assign([], this.broadcastService.roomState[this.gameId])
    const room = gameRooms.filter((room: any) => room.roomId === this.roomId)
    this.room.players.filter((player: any) => player.id === this.userId)[0].ready = !this.ready
    room[0] = this.room
    this.broadcastService.updateRoomState(this.gameId, gameRooms)
  }

  getReadyOrNotClass(ready: boolean){
    return ready ? 'ready-player': 'unready-player';
  }
}
