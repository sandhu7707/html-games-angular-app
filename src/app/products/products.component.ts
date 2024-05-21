import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { RoomState } from '../services/chat-service/RoomState.type';
import { BroadcastService } from '../services/chat-service/broadcast.service';
import { lastValueFrom } from 'rxjs';
import { UserService } from '../services/id-service/user.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {

  MINESWEEPER_ID = 'MINESWEEPER_ID'
  userId!: string;
  rooms: any

  constructor(private broadcastService: BroadcastService, private router: Router, private userService: UserService){
    this.rooms = broadcastService.currentRoomState ? broadcastService.currentRoomState : []
    console.log("products.component constructor")
    broadcastService.roomStateObservable.subscribe((roomState) => {
      // console.log(roomState)
      this.rooms = roomState
    })
    this.userId = userService.id
    this.alreadyJoined(null, true, this.MINESWEEPER_ID)
  }

  createRoom(gameId: string){
    const rooms = this.rooms[gameId] ? this.rooms[gameId]: []
    const newRoom =           {
      name: `${this.userService.name}'s room`,
      hostId: this.userId,
      roomId: rooms.length + 1,
      players: []
    }
    this.updateRoomState(gameId, [...rooms, newRoom])
      this.router.navigate([`/products/game/${gameId}/${newRoom.roomId}`])
  }

  joinRoom(gameId: string, idx: number){
    const  gameRooms = this.rooms[gameId]
    gameRooms[idx].players.push(this.userId)
    this.updateRoomState(gameId, gameRooms)
    this.router.navigate([`/products/game/${gameId}/${this.rooms[gameId][idx].roomId}`])
  }

  alreadyJoined(roomId: number | null, navigate: boolean | null, gameId: string | null){
    for(let i in {...this.rooms}){
      const playerRooms = {...this.rooms}[i].filter((room: any) => room.players.indexOf(this.userId) !== -1 || room.hostId === this.userId);
      if(playerRooms.length > 0){
        if(roomId){
          return playerRooms.filter((room:any) => room.roomId === roomId).length > 0
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

  leaveRoom(gameId: string, roomId: number){
    const gameRooms = this.rooms[gameId]
    for(let i in gameRooms){
      if(gameRooms[i].roomId !== roomId) {
        continue;
      }
      if(gameRooms[i].hostId === this.userId){
        if(window.confirm('leaving this room while remove the room, proceed ?')){
          gameRooms.splice(i, 1)
          this.updateRoomState(gameId, gameRooms)
        }
        return;
      }

      let playerIdx = this.rooms[gameId][i].players.indexOf(this.userId);
      if(playerIdx !== -1){
        gameRooms[i].players.splice(playerIdx, 1)
        this.updateRoomState(gameId, gameRooms)
        return;
      }
    }
  }

  updateRoomState(gameId: string, gameRooms: any[]){
    this.broadcastService.updateRoomState(gameId, gameRooms)
  }

}
