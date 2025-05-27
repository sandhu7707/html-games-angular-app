import { Component } from '@angular/core';
import { UserService } from '../services/id-service/user.service';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatButton],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  constructor(protected userService: UserService, private router: Router){

  }

  logOut(){
    this.userService.logout()
    this.router.navigate(['/login'])
  }
}
