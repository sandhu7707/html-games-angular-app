import { AfterViewInit, Component, inject, OnChanges, signal, WritableSignal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators, AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../services/user-service/user.service';
import { User } from '../services/user-service/user.type';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {MatDialog} from '@angular/material/dialog';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';

@Component({
  selector: 'app-form-component',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinner],
  templateUrl: './form-component.component.html',
  styleUrl: './form-component.component.css'
})
export class FormComponentComponent{

  action: WritableSignal<"signin"|"signup"> = signal("signin");
  dialog = inject(MatDialog)

  changeActionToSignUp(){
    this.action.set("signup");
    this.username.addAsyncValidators(this.usernameUnavailable);
    this.inputControl.reset();
  }

  changeActionToSignIn(){
    this.action.set("signin");
    this.username.removeAsyncValidators(this.usernameUnavailable);
    this.inputControl.reset();
  }

  usernameUnavailable: AsyncValidatorFn = async (control: AbstractControl): Promise<ValidationErrors | null> => {
    return fetch(`http://localhost:3000/username-check/${control.value}`)
        .then((value) => value.json())
        .then(body => body.available ? {} : {usernameUnavailable: true})
        .catch((err: Error) => {
          return {fetchError: true}
        })
  }

  inputControl = new FormGroup({
    username: new FormControl("", [Validators.required, Validators.minLength(4)], this.action() === "signup" ? this.usernameUnavailable : []),
    password: new FormControl("", [Validators.minLength(4), Validators.required])
  })

  get username(){
    return this.inputControl.get('username')!
  }

  get password(){
    return this.inputControl.get('password')!
  }

  webSocket!: WebSocket

  constructor(private httpClient: HttpClient, private userService: UserService, private router: Router){
    if(userService.id){
      router.navigate(['/home'])
    }
  }

  onRegister(e: any){
    this.inputControl.updateValueAndValidity();
    if(!this.inputControl.valid){
      return;
    }
    // console.log(this.inputControl.value)
    this.httpClient.post<User>(`${environment.serverHttpUrl}user/register`, this.inputControl.value)
    .subscribe({
      next: (user) => {
        this.userService.initUserService(user)
        this.router.navigate(['/home'])
      },
      error: (err) => this.dialog.open(ErrorDialogComponent, {width: '50vw', height: '50vh', data:{message: 'Error trying to Sign Up!'}})
    })
  }

  onSignIn(e: any){
    this.inputControl.updateValueAndValidity();
    if(!this.inputControl.valid){
      return;
    }
    console.log("sign in")
    this.httpClient.post<User>(`${environment.serverHttpUrl}user/authenticate`, this.inputControl.value)
    .subscribe({
      next: (user) => {
        this.userService.initUserService(user)
        this.router.navigate(['/home'])
      },
      error: (err) => this.dialog.open(ErrorDialogComponent, {width: '50vw', height: '50vh', data:{message: 'Error trying to Sign In!'}})
    })
  }

}
 