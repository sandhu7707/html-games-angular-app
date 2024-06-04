import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, ContentChild, ElementRef, Input, EventEmitter, Output} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { GameAreaComponent } from './game-area/game-area.component';
import { GameResult } from './gameResults';
import { UserService } from '../../services/id-service/user.service';
import { BroadcastService } from '../../services/broadcast-service/broadcast.service';
import { Subscription } from 'rxjs';
const gameConfValidator: ValidatorFn = (control: AbstractControl) => {
  return control.value.minesNum < control.value.tilesNum ? null : { numberOfMinesGreaterThanNumberOfTiles: true}
}

@Component({
  selector: 'app-minesweeper',
  standalone: true,
  imports: [RouterLink, RouterOutlet, CommonModule, ReactiveFormsModule, GameAreaComponent],
  templateUrl: './minesweeper.component.html',
  styleUrl: './minesweeper.component.css'
})
export class MinesweeperComponent implements AfterContentInit{

  @Input() gameId!: string
  @Input() roomId!: string
  ready!: boolean
  userId!: string
  defaultTilesNum = 4
  defaultMinesNum = 2
  gameConf = new FormGroup({
    tilesNum: new FormControl(4, Validators.min(4)),
    minesNum: new FormControl(2)    
  }, { validators: gameConfValidator})

  @Input('gameContainer') gameContainer!: ElementRef


  isUnvalid = this.gameConf.errors?.['numberOfMinesGreaterThanNumberOfTiles']

  checkErrors = () => {console.log(this.gameConf.errors)}

  tileMap!: number[];
  
  minesMap!: number[];
  
  @Input() room!: any
  @Output() updateGameRoom = new EventEmitter<any>
  minesNum!: number

  gameResult!: GameResult

  results!: string[]

  gameState: number = 0;
  // 0 -> start screen -> waiting area/ dealer screen for dealer -> move to 1 when all ready
  // 1 -> currently playing
  // 2 -> paused 
  // 3 -> over/finish screen -> updates as everyone finishes, can also show active players

  constructor(private userService: UserService, private broadcastService: BroadcastService, private router: Router){

    console.log("minesweeper constructor init", this.broadcastService.gameRoom)
    if(userService.id)
      this.userId = userService.id
    else
      router.navigate(['/'])
  }

  ngAfterContentInit(): void {
    
    if(!this.broadcastService.gameRoom){
      alert('this room doesn\'t exist anymore')
      this.router.navigate(['/products'])
    }
    console.log(this.room)
    console.log(this.updateGameRoom)
    this.minesMap = this.room.tilesMap
        this.results = []
        this.room.players.forEach((element: any) => {
          console.log(typeof element.result)
          if(element.result !== undefined && element.result !== null){
            this.results.push(`${element.name}: ${element.result.areaCovered}`)
          }
        });
        console.log(this.results)
        if(this.minesMap){
          this.tileMap = new Array(this.minesMap.length).fill(0)
        }
        if(this.room.dealerId !== this.userId && this.gameState === 0){
          this.gameState = 1
        }
    const playerInfo = this.room.players.find((player: any) => player.id === this.userId);
    if(playerInfo && playerInfo.result && playerInfo.result.tilesMap){
      this.gameResult = playerInfo.result
      this.gameState = 3
    }
  }


  startGame(){

    let tilesNum: number = this.gameConf.value.tilesNum ? this.gameConf.value.tilesNum: this.defaultTilesNum
    this.tileMap = new Array(tilesNum).fill(0)
    this.minesMap = new Array(tilesNum).fill(0)
    this.minesNum = this.gameConf.value.minesNum ? this.gameConf.value.minesNum : this.defaultMinesNum
    this.gameState = 1;
  }

  updateTilesMap(tilesMap: number[]) {
    console.log(tilesMap)
    this.room['ready'] = true;

    this.room.tilesMap = tilesMap
    console.log(this.room)
    this.updateGameRoom.emit(this.room)
    this.gameState = 3;
  }

  restartGame(){
    this.gameState = 1;
  }

  onPauseClick(){
    if(this.gameState === 1)
      this.gameState = 2;
    else if(this.gameState === 2)
      this.gameState = 1;
  }

  onGameResult(e: GameResult){
    console.log(e);
    // this.gameResult = e;
    if(e !== undefined && e !== null){
      this.room.players.filter((player:any) => player.id === this.userId)[0].result = e
    }
    console.log(this.room)
    this.updateGameRoom.emit(this.room)
    this.gameState = 3;
  }
}