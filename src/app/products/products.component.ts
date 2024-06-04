import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { BroadcastService } from '../services/broadcast-service/broadcast.service';
import { UserService } from '../services/id-service/user.service';


export const MINESWEEPER_ID = 'MINESWEEPER';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {

  MINESWEEPER_ID = MINESWEEPER_ID;
  userId!: string;
  rooms: {[key: string]: {[key: number]: any }}

  constructor(private broadcastService: BroadcastService, private router: Router, private userService: UserService){
    this.rooms = broadcastService.currentRoomState ? broadcastService.currentRoomState : []
    console.log("products.component constructor")
    broadcastService.roomStateObservable.subscribe((roomState) => {
      console.log(roomState)
      this.rooms = roomState
    })
    if(userService.id)
      this.userId = userService.id
    else 
      router.navigate(['/'])
  }

  createRoom(gameId: string){
    const rooms = this.rooms[gameId]
    console.log(rooms)
    this.broadcastService.createRoom(gameId, {name: `${this.userService.name}'s room`}, 
    (event: any, defaultHandler: undefined | ((event: any) => any)) => {
      const message = JSON.parse(event.data)
      console.log(message)
      if(message && message.type === 'create-room'){
        const room = message.data
        this.router.navigate([`/products/game/${gameId}/${room.roomId}`])
      }
      else if(defaultHandler){
        defaultHandler(event)
      }
    })
  }

  joinRoom(gameId: string, roomId: any){
    console.log("roomId, ", roomId, "rooms: ", this.rooms)

    this.broadcastService.joinRoom(gameId, roomId)
    this.router.navigate([`/products/game/${gameId}/${roomId}`])
  }

  alreadyJoined(roomId: string | null, navigate: boolean | null, gameId: string | null){
    for(let i in {...this.rooms}){
      const playerRooms = Object.values({...this.rooms}[i]).filter((room: any) => room.players.filter((player: any) => player.id === this.userId).length > 0);
      if(playerRooms.length > 0){
        if(roomId){
          return playerRooms.filter((room:any) => room.roomId === parseInt(roomId)).length > 0
        }
        else{
          if(navigate && gameId) {
            this.router.navigate([`/products/game/${gameId}/${playerRooms[0].roomId}`])
          }
          return true;
        }
      }
    }
    return false;
  }

  leaveRoom(gameId: string, roomId: any){
    const gameRooms = this.rooms[gameId]
    roomId = parseInt(roomId)
    console.log(roomId, gameRooms)
      if(!gameRooms[roomId]) {
        console.log('no room with roomId')
        return;
      }
      if(gameRooms[roomId].hostId === this.userId){
        if(window.confirm('leaving this room will remove the room, proceed ?')){
          this.broadcastService.leaveRoom(gameId, roomId)
        }
      }
      else{
        this.broadcastService.leaveRoom(gameId, roomId)        
      }
      this.router.navigate(['products'])
  }

}
