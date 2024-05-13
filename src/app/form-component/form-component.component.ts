import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// const x = 3;

@Component({
  selector: 'app-form-component',
  standalone: true,
  imports: [FormsModule, CommonModule],
  // template: `<p>something ${x}</p>`,
  templateUrl: './form-component.component.html',
  styleUrl: './form-component.component.css'
})
export class FormComponentComponent {

  uid: number = 10;

  x = 2;
  needsLastName=false
  submit(event: any){
    console.log("form submitted", event)
  }
}
 