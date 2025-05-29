import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { MatButtonModule} from '@angular/material/button';
import { MatIconModule, MatIconRegistry} from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-add-game',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './add-game.component.html',
  styleUrl: './add-game.component.css'
})
export class AddGameComponent {

  @ViewChild("fileInput") fileInput!: ElementRef;

  handleChange = (e: any) => {
    console.log(e.target.files[0]);
  }

  constructor(private httpClient: HttpClient, private router: Router, iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, public matDialog: MatDialog){
    iconRegistry.addSvgIcon('attach', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/attach.svg'))
  }

  // reload = () => {
  //   window.location.reload();
  // }

  upload = () => {
    if(this.fileInput.nativeElement.files.length == 0){
      this.matDialog.open(ErrorDialogComponent, {width: '50vw', height: '50vh', data: {message: "Please choose a file first"}})
    }

    const fileReader = new FileReader()
    fileReader.readAsArrayBuffer(this.fileInput.nativeElement.files[0])
    const name = this.fileInput.nativeElement.files[0].name.split('.')[0]
    console.log(name)


    fileReader.onloadend = () => {
      this.httpClient.post(`${environment.serverHttpUrl}games/upload/${name}`, fileReader.result, {headers: {'Content-Type': 'application/octet-stream'}}).subscribe(
        data => {
          console.log('upload successful')
          this.router.navigate(['/home']).then(() => window.location.reload())
        }
      )
    }
  }
}
