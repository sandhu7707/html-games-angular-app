import { Component } from '@angular/core';
import { UserService } from '../services/user-service/user.service';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { BroadcastService } from '../services/broadcast-service/broadcast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatButton],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  constructor(protected userService: UserService, private router: Router, private broadcastService: BroadcastService){

  }

  logOut(){
    this.userService.logout()
    this.router.navigate(['/login'])
    this.broadcastService.logout()
  }
}
