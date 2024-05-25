import { AfterViewInit, Component, OnChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../services/id-service/user.service';
import { User } from '../services/id-service/user.type';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
// import { IP_ADDR } from '../../main';
// const x = 3;

@Component({
  selector: 'app-form-component',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  // template: `<p>something ${x}</p>`,
  templateUrl: './form-component.component.html',
  styleUrl: './form-component.component.css'
})
export class FormComponentComponent{

  inputControl = new FormGroup({
    username: new FormControl(""),
    password: new FormControl("")
  })
  webSocket!: WebSocket

  constructor(private httpClient: HttpClient, private userService: UserService, private router: Router){
    if(userService.id){
      router.navigate(['/home'])
    }
  }

  onRegister(e: any){
    // console.log(this.inputControl.value)
    this.httpClient.post<User>(`${environment.serverHttpUrl}user/register`, this.inputControl.value)
    .subscribe({
      next: (user) => {
        this.userService.initUserService(user)
        this.router.navigate(['/home'])
      },
      error: (err) => console.log("err", err.status)
    })
  }

  onSignIn(e: any){
    console.log("sign in")
    this.httpClient.post<User>(`${environment.serverHttpUrl}user/authenticate`, this.inputControl.value)
    .subscribe({
      next: (user) => {
        this.userService.initUserService(user)
        this.router.navigate(['/home'])
      },
      error: (err) => console.log("err", err.status)
    })
  }

}
 