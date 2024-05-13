import { Component, ContentChild } from '@angular/core';
import { IdServiceService } from '../services/id-service/id-service.service';
import { PersonalSectionComponent } from '../personal-section/personal-section.component';
import { CommonModule } from '@angular/common';
import { CommonContentDirective } from './common-content.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PersonalSectionComponent, CommonModule, CommonContentDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  name!: string;
  id: string;
  tags: string[] = [];

  constructor(idService: IdServiceService){
    idService.nameObservable.subscribe((name) => {
      this.name = name;
    })

    this.id = idService.id;
  }

  addTag(tag: string){
    this.tags.push(tag)
  }
}
