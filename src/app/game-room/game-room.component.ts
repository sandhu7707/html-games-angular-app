import { Component, Input, AfterContentInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BroadcastService } from '../services/broadcast-service/broadcast.service';
import { Router } from '@angular/router';
import { UserService } from '../services/id-service/user.service';
import { MinesweeperComponent } from '../product-items/minesweeper/minesweeper.component';

@Component({
  selector: 'app-game-room',
  standalone: true,
  imports: [CommonModule, MinesweeperComponent],
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
      console.log("game-room message received", message.data.players[0], this.userId)
      if(message.type === 'init' && message.data !== 0){
        alert('this room doesn\'t exist anymore')
        this.broadcastService.gameRoom.close()
        this.router.navigate(['/products'])
      }
      else if(message.type === 'update'){
        if(!message.data.players.find((player:any) => player.id === this.userId)){
          alert('join room before accessing it')
          this.router.navigate(['/products'])
        }
        console.log(message.data)
        const room = message.data
        this.room = room
        this.hostName = room.players.find((player: any) => player.id === room.hostId).name
        this.ready = room.players.find((player: any) => player.id === this.userId).ready
        this.dealerName = room.players.find((player: any) => player.id === room.dealerId).name  
      }
    })
  }

  renderGame() {
    return this.room && (this.room.ready && this.ready) || (this.ready && this.userId === this.room.dealerId)
  }

  ngAfterContentInit(): void {
    this.startGameRoom()
  }

  readyButtonLabel(){
    return this.room.dealerId === this.userId ? this.ready ? "Not Ready" : "Ready" : this.ready ? "Restart" : "Start"
  }

  toggleReady(){

    if(!this.room.ready && this.userId !== this.room.dealerId){
      alert('Room is not ready')
      return;
    }
    
    this.room.players.filter((player: any) => player.id === this.userId)[0].ready = !this.ready
    this.updateRoom(this.room)
  }

  getReadyOrNotClass(ready: boolean){
    return ready ? 'ready-player': 'unready-player';
  }
}
