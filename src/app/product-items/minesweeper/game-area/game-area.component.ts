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
  @ViewChild("gameplayArea") gameplayArea!: ElementRef
  @Input() gameContainer!: any;
  tileSize!: number
  @Output() gameResult = new EventEmitter<GameResult>()

  gameOver:boolean = false;
  gameOverMessage!: string;

  safeTiles: number = 0;

  constructor(@Inject(DOCUMENT)private document: Document){
  }

  ngAfterContentInit(): void {
    this.tileSize = 80/Math.ceil(Math.sqrt(this.tilesMap.length)) 
    console.log("tile size", this.tileSize, "tilesMap", this.tilesMap)
  }

  logClick(e: any){
    if(this.gameOver){
      return;
    }
    if(this.tilesMap[e.target.id] === 0){
      e.target.classList.add("safe")
      e.target.style.backgroundColor = 'white'
      this.safeTiles++;
    }
    else{
      e.target.classList.add("mine")
      e.target.style.backgroundColor = 'red'
      this.gameOver = true
      const result = {
        areaCovered: this.safeTiles*100/this.tilesMap.length
      };
      this.gameOverMessage = `${result.areaCovered}: ${100 - result.areaCovered}`;
      this.gameResult.emit(result)
    }
  }


}
