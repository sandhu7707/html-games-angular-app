import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { GameAreaComponent } from './game-area/game-area.component';
import { GameResult } from './gameResults';

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
export class MinesweeperComponent {

  @Input() id!: number;
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
  
  gameState: number = 0;
  // 0 -> start screen
  // 1 -> currently playing
  // 2 -> paused 
  // 3 -> over/finish screen

  startGame(){
    console.log("sadasd", this.gameConf.value)

    let tilesNum: number = this.gameConf.value.tilesNum ? this.gameConf.value.tilesNum: this.defaultTilesNum
    this.tileMap = new Array(tilesNum).fill(0)

    let minesNum: number = this.gameConf.value.minesNum ? this.gameConf.value.minesNum: this.defaultMinesNum
    while(minesNum > 0){
      let i = Math.floor(Math.random()*tilesNum)
      if(this.tileMap[i] === 0){
        this.tileMap[i] = 1;
        minesNum--;
      }
    }
    this.gameState = 1;
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
    console.log(e)
  }

}