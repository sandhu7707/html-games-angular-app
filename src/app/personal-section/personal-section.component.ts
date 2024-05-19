import { Component, Input, Output, OnChanges, SimpleChanges, EventEmitter, TemplateRef, ContentChild } from '@angular/core';
import { CommonContentDirective } from '../home/common-content.directive';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-personal-section',
  standalone: true,
  imports: [CommonContentDirective, CommonModule],
  templateUrl: './personal-section.component.html',
  styleUrl: './personal-section.component.css'
})
export class PersonalSectionComponent implements OnChanges {

  @Input() name!: string
  @Input() id!: string
  @Output() tagEvent = new EventEmitter<string>()

  @ContentChild(CommonContentDirective) commonContent!: CommonContentDirective;

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['name'].currentValue === undefined || changes['name'].currentValue === ""){
      this.name = `Player ${this.id}`
    }
  }

  emitTag(tag: string){
    console.log("added: ", tag)
    this.tagEvent.emit(tag);
  }

}
