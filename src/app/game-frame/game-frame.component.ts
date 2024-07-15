import { DOCUMENT } from '@angular/common';
import { AfterContentInit, Component, Inject, InjectionToken, Input } from '@angular/core';
import { UserService } from '../services/id-service/user.service';

@Component({
  selector: 'app-game-frame',
  standalone: true,
  imports: [],
  templateUrl: './game-frame.component.html',
  styleUrl: './game-frame.component.css'
})
export class GameFrameComponent implements AfterContentInit{

  @Input() gameId!: string 
  @Input() roomId!: string
  userId!: string

  constructor(@Inject(DOCUMENT) private document: any, private userService: UserService) {
    this.userId = userService.id!
  }

  ngAfterContentInit(): void {
    const gameFrame = this.document.getElementById("game-frame")
    console.log(gameFrame)
    gameFrame.src = `http://localhost:3000/games/${this.gameId}/index.html?gameId=${this.gameId}&roomId=${this.roomId}&userId=${this.userId}`
    console.log(gameFrame.srcdoc)
  }
}
