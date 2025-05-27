import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-game',
  standalone: true,
  imports: [],
  templateUrl: './add-game.component.html',
  styleUrl: './add-game.component.css'
})
export class AddGameComponent {

  @ViewChild("fileInput") fileInput!: ElementRef;

  handleChange = (e: any) => {
    console.log(e.target.files[0]);
  }

  constructor(private httpClient: HttpClient, private router: Router){

  }

  // reload = () => {
  //   window.location.reload();
  // }

  upload = () => {

    const fileReader = new FileReader()
    fileReader.readAsArrayBuffer(this.fileInput.nativeElement.files[0])
    const name = this.fileInput.nativeElement.files[0].name.split('.')[0]
    console.log(name)


    fileReader.onloadend = () => {
      this.httpClient.post(`${environment.serverHttpUrl}games/upload/${name}`, fileReader.result, {headers: {'Content-Type': 'application/octet-stream'}}).subscribe(
        data => {
          console.log('upload successful')
          window.location.reload()
          // console.log('reload')
          this.router.navigate(['/home'])
          // console.log(data)
        }
      )
    }
  }
}
