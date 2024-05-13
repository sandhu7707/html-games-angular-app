import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appCommonContent]',
  standalone: true
})
export class CommonContentDirective {

  constructor(public templateRef: TemplateRef<unknown>){
  }

}
