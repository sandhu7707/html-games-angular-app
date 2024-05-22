import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { RoomState } from '../services/broadcast-service/RoomState.type';
import { BroadcastService } from '../services/broadcast-service/broadcast.service';
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
      roomId: rooms.length === 0 ? 1 : rooms[rooms.length-1].roomId+1,
      dealerId: this.userId,
      players: [{
        id: this.userId,
        name: this.userService.currentNickname,
        ready: false
      }]
    }
    this.updateRoomState(gameId, [...rooms, newRoom])
      this.router.navigate([`/products/game/${gameId}/${newRoom.roomId}`])
  }

  joinRoom(gameId: string, roomId: number){
    console.log("roomId, ", roomId, "rooms: ", this.rooms)

    const  gameRooms = this.rooms[gameId]
    gameRooms.filter((room:any) => room.roomId === roomId)[0].players.push(
      {id: this.userId, name: this.userService.currentNickname})
    this.updateRoomState(gameId, gameRooms)
    this.router.navigate([`/products/game/${gameId}/${roomId}`])
  }

  alreadyJoined(roomId: number | null, navigate: boolean | null, gameId: string | null){
    for(let i in {...this.rooms}){
      const playerRooms = {...this.rooms}[i].filter((room: any) => room.players.filter((player: any) => player.id === this.userId).length > 0);
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
        if(window.confirm('leaving this room will remove the room, proceed ?')){
          gameRooms.splice(i, 1)
          this.updateRoomState(gameId, gameRooms)
        }
        return;
      }

      let player = this.rooms[gameId][i].players.filter((player: any) => player.id === this.userId);
      if(player.length > 0){
        player.splice(0, 1)
        this.updateRoomState(gameId, gameRooms)
        this.router.navigate([`/products`])
        return;
      }
    }
  }

  updateRoomState(gameId: string, gameRooms: any[]){
    this.broadcastService.updateRoomState(gameId, gameRooms)
  }

}
