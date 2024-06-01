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
    this.alreadyJoined(null, true, this.MINESWEEPER_ID)
  }

  createRoom(gameId: string){
    const rooms = this.rooms[gameId]
    console.log(rooms)
    // console.log(Object.keys(rooms))
    const newRoom =           {
      name: `${this.userService.name}'s room`,
      hostId: this.userId,
      roomId: !rooms || Object.keys(rooms).length === 0 ? 1 : rooms[parseInt(Object.keys(rooms)[Object.keys(rooms).length-1])].roomId+1,
      dealerId: this.userId,
      players: [{
        id: this.userId,
        name: this.userService.currentNickname,
        ready: false
      }]
    }
    this.updateRoomState(gameId,{...rooms, [newRoom.roomId]: newRoom})
    this.router.navigate([`/products/game/${gameId}/${newRoom.roomId}`])
  }

  joinRoom(gameId: string, roomId: any){
    console.log("roomId, ", roomId, "rooms: ", this.rooms)

    const  gameRooms = this.rooms[gameId]
    gameRooms[roomId].players.push(
      {id: this.userId, name: this.userService.currentNickname})
    this.updateRoomState(gameId, gameRooms)
    this.router.navigate([`/products/game/${gameId}/${roomId}`])
  }

  alreadyJoined(roomId: string | null, navigate: boolean | null, gameId: string | null){
    // console.log("check already joined")
    for(let i in {...this.rooms}){
      const playerRooms = Object.values({...this.rooms}[i]).filter((room: any) => room.players.filter((player: any) => player.id === this.userId).length > 0);
      if(playerRooms.length > 0){
        if(roomId){
          console.log(typeof roomId, playerRooms, typeof playerRooms[0].roomId)
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
    for(let i in gameRooms){
      if(gameRooms[i].roomId !== roomId) {
        console.log('skipped')
        continue;
      }
      if(gameRooms[i].hostId === this.userId){
        if(window.confirm('leaving this room will remove the room, proceed ?')){
          delete gameRooms[i]
          this.updateRoomState(gameId, gameRooms)
          this.broadcastService.closeGameRoom()
        }
        return;
      }

      let player = gameRooms[i].players.find((player: any) => player.id === this.userId);
      if(player){
        console.log(player)
        gameRooms[i].players.splice(gameRooms[i].players.indexOf(player), 1)
        console.log(gameRooms)
        this.updateRoomState(gameId, gameRooms)
        this.broadcastService.removePlayer(gameId, roomId)
        this.router.navigate([`/products`])
        return;
      }
    }
  }

  updateRoomState(gameId: string, gameRooms: any){
    this.broadcastService.updateRoomState(gameId, gameRooms)
  }

}
