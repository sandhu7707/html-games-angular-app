import { Inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { User } from './user.type';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  loggedIn!: boolean

  username!: string
  currentId!: string 
  currentNickname!: string

  _id = new Subject<string>;
  idObservable = this._id.asObservable();
  set id(id: string){
    this._id.next(id)
    this.currentId = id
  }

  get id(){
    return this.currentId;
  }

  _name = new Subject<string>;
  nameObservable = this._name.asObservable();

  set name(name: string) {
    this._name.next(name)
    localStorage.setItem("nickname", name)
    this.currentNickname = name
  }

  get name(){
    return this.currentNickname
  }

  constructor(@Inject(PLATFORM_ID) private platformId: any){
    console.log(platformId)
    if(this.isBrowser()){
        if(localStorage.getItem("userId")){
          this.loggedIn = true
          this.id = localStorage.getItem("userId")!
        }
        
        if(localStorage.getItem("username")){
          this.username = localStorage.getItem("username")!
        }

        if(localStorage.getItem("nickname")){
          this.name = localStorage.getItem("nickname")!
        }
    }

  }

  initUserService(user: User){
    this.id = user.id
    this.name = user.username

    if(this.isBrowser()){
        localStorage.setItem("userId", user.id)
        localStorage.setItem("username", user.username)
        localStorage.setItem("nickname", user.username)
        this.loggedIn = true;
    }
  }

  logout(){
    if(this.isBrowser()){
      localStorage.clear()
      this.loggedIn = false;
    }
  }

  isBrowser = () => this.platformId === "browser"
}