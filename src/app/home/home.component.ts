import { Component } from '@angular/core';
import { UserService } from '../services/id-service/user.service';
import { PersonalSectionComponent } from '../personal-section/personal-section.component';
import { CommonModule } from '@angular/common';
import { CommonContentDirective } from './common-content.directive';
import { ProductsComponent } from '../products/products.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PersonalSectionComponent, CommonModule, CommonContentDirective, ProductsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  name!: string;
  id!: string;
  tags: string[] = [];

  constructor(idService: UserService){
    idService.nameObservable.subscribe((name) => {
      this.name = name;
    })

    this.id = idService.id
  }

  addTag(tag: string){
    this.tags.push(tag)
  }
}
