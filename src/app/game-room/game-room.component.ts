import { Component, Input, AfterContentInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BroadcastService } from '../services/broadcast-service/broadcast.service';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
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
  updateRoom!: (room: any) => void
  hostName!: string
  dealerName!: string
  room!: any
  // broadcastServiceSubscription: Subscription
  ready!: boolean
  userId!: string

  constructor(private broadcastService: BroadcastService, private router: Router, private userService: UserService) {
    if(userService.id)
      this.userId = userService.id
    else
      router.navigate(['/'])
  }

  startGameRoom(){
    this.updateRoom = this.broadcastService.startGameRoom(this.gameId, parseInt(this.roomId),
     (message: any) => {
      console.log("game-room message received", message)
      if(message.type === 'init' && message.data !== 0){
        alert('this room doesn\'t exist anymore')
        this.broadcastService.gameRoom.close()
        this.router.navigate(['/products'])
      }
      else if(message.type === 'update'){
        console.log(message.data)
        const room = message.data
        this.room = room
        this.hostName = room.players.find((player: any) => player.id === room.hostId).name
        this.ready = room.players.find((player: any) => player.id === this.userId).ready
        this.dealerName = room.players.find((player: any) => player.id === room.dealerId).name  
      }
    })

    console.log(this.updateRoom)
  }

  ngAfterContentInit(): void {
    this.startGameRoom()
  }

  readyButtonLabel(){
    return this.room.dealerId === this.userId ? this.ready ? "Not Ready" : "Ready" : this.ready ? "Restart" : "Start"
  }

  toggleReady(){
    if(!this.ready && this.room.dealerId === this.userId){
      this.router.navigate([`products/game/${this.gameId}/${this.roomId}/play`])
    }
    else if(!this.room.ready){
      alert('Room is not ready')
    }
    else if(!this.ready && this.room.ready === true){
      // const gameRooms = Object.assign([], this.broadcastService.roomState[this.gameId])
      // const room = gameRooms.filter((room: any) => room.roomId === this.roomId)
      this.room.players.filter((player: any) => player.id === this.userId)[0].ready = !this.ready
      this.updateRoom(this.room)
      this.router.navigate([`products/game/${this.gameId}/${this.roomId}/play`])
    }
    else if(this.ready){
      this.ready = !this.ready
    }
  }

  getReadyOrNotClass(ready: boolean){
    return ready ? 'ready-player': 'unready-player';
  }
}
