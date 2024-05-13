import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IdServiceService {

  id: string

  _name = new Subject<string>;
  nameObservable = this._name.asObservable();

  constructor() { 
    this.id = (Math.random()*1000).toFixed(0)
    console.log("id created")
  }

  set name(name: string) {
    this._name.next(name)
  }

}
