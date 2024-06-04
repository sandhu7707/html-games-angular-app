import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, Input, ViewChild, Output, EventEmitter, AfterContentInit } from '@angular/core';
import { GameResult } from '../gameResults';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-game-area',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-area.component.html',
  styleUrl: './game-area.component.css'
})
export class GameAreaComponent implements AfterContentInit{

  @Input() tilesMap!: number[];
  @Output() tilesMapOutput = new EventEmitter<number[]>;
  @ViewChild("gameplayArea") gameplayArea!: ElementRef
  @Input() gameContainer!: any;
  @Input() playerResult!: GameResult
  tileSize!: number
  @Output() gameResult = new EventEmitter<GameResult>()

  gameOver:boolean = false;
  gameOverMessage!: string;
  
  @Input() gameReady!: boolean
  @Input() minesNum!: number

  @Input() minesMap!: number[]

  safeTiles: number = 0;
  mines!: number[]

  constructor(@Inject(DOCUMENT)private document: Document){
  }

  ngAfterContentInit(): void {
    console.log(this.tilesMap, "gameReady: ", this.gameReady)
    this.tileSize = 80/Math.ceil(Math.sqrt(this.tilesMap.length)) 
    console.log("tile size", this.tileSize, "tilesMap", this.tilesMap)
    this.mines = new Array(this.tilesMap.length).fill(0)
  }
  logClick(e: any){
    
    if(this.gameOver){
      return;
    }
    if(this.gameReady) {
      console.log(e.currentTarget)
      console.log(e.target.id)
      if(this.minesMap[e.target.id] === 0){
        e.target.classList.add("safe")
        this.mines[e.target.id] = -1
        this.safeTiles++;
      }
      else{
        e.target.classList.add("mine")
        this.mines[e.target.id] = 1
        this.gameOver = true
        const result = {
          tilesMap: this.mines,
          areaCovered: this.safeTiles*100/this.tilesMap.length
        };
        this.gameOverMessage = `${result.areaCovered}: ${100 - result.areaCovered}`;
        this.gameResult.emit(result)
      }
    }
    else if(this.minesNum > 0 && this.tilesMap[e.target.id] === 0){
      console.log(e.currentTarget)
      console.log(e.target.id)
      e.target.classList.add("mine")
      this.mines[e.target.id] = 1
      this.minesNum--;
    }

    if(this.minesNum === 0){
      this.gameOver = true
      this.tilesMapOutput.emit(this.mines)
      const result = {
        tilesMap: this.mines,
        areaCovered: this.safeTiles*100/this.tilesMap.length
      };
      this.gameResult.emit(result)
    }
  }

  getClass(idx: number){
    if(!this.playerResult || !this.playerResult.tilesMap){
      return 'minesweeper-tile'
    }
    let className = ''
    if(this.playerResult.tilesMap[idx]===-1){
      className = 'safe'
    }
    else if(this.playerResult.tilesMap[idx]===1){
      className = 'mine'
    }
    return `minesweeper-tile ${className}`
  }


}

