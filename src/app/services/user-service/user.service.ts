import { Inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { User } from './user.type';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  loggedIn!: boolean

  username!: string|null
  currentId!: string|null 
  currentNickname!: string|null

  _id = new Subject<string|null>;
  idObservable = this._id.asObservable();
  set id(id: string|null){
    this._id.next(id)
    this.currentId = id
  }

  get id(): string|null{
    return this.currentId;
  }

  _name = new Subject<string|null>;
  nameObservable = this._name.asObservable();

  set name(name: string|null) {
    this._name.next(name)
    if(name){
      localStorage.setItem("nickname", name)
    }
    this.currentNickname = name
  }

  get name(): string|null{
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
      this.id = null
      this.username = null
      this.name = null
      this.loggedIn = false;
    }
  }

  isBrowser = () => this.platformId === "browser"
}