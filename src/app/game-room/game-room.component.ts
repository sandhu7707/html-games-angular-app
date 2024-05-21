import { Component, Input, AfterContentInit, OnChanges } from '@angular/core';
import { BroadcastService } from '../services/chat-service/broadcast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-room',
  standalone: true,
  imports: [],
  templateUrl: './game-room.component.html',
  styleUrl: './game-room.component.css'
})
export class GameRoomComponent implements AfterContentInit{

  @Input() gameId!: string
  @Input() roomId!: string
  rooms!: any

  constructor(private broadcastService: BroadcastService, private router: Router) {
    broadcastService.roomStateObservable.subscribe((roomState) => {
      this.rooms = roomState[this.gameId]
      this.navigateIfRoomDoesntExist()
    })
  }

  navigateIfRoomDoesntExist(){
    if(!this.rooms || [...this.rooms].filter((room: any) => room.roomId === parseInt(this.roomId)).length === 0){
      console.log([...this.rooms].filter((room: any) => room.roomId === parseInt(this.roomId)).length === 0)
      this.router.navigate(['/products'])
      alert('this room doesn\'t exist anymore')
    }
  }

  ngAfterContentInit(): void {
    this.rooms = this.broadcastService.currentRoomState[this.gameId] ? this.broadcastService.currentRoomState[this.gameId] : []
    this.navigateIfRoomDoesntExist()
  }

}
