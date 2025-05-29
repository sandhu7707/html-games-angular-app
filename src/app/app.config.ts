import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, ViewTransitionInfo, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AddGameComponent } from './add-game/add-game.component';
import { ProfileComponent } from './profile/profile.component';
import { FormComponentComponent } from './form-component/form-component.component';
import { ProductsComponent } from './products/products.component';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withComponentInputBinding(), withViewTransitions({onViewTransitionCreated})), provideClientHydration(), importProvidersFrom(HttpClientModule), provideAnimationsAsync()]
};

function onViewTransitionCreated(transitionInfo: ViewTransitionInfo){

  const from = transitionInfo.from.firstChild;
  const to = transitionInfo.to.firstChild;

  console.log(to, to?.component === FormComponentComponent)

  
  if(from?.component === ProfileComponent && to?.component === FormComponentComponent){
    console.log('logout transition');
    (transitionInfo.transition as any).types.add('logout')
  }else if((from?.component === AddGameComponent && to?.component === ProductsComponent )||(from?.component === ProfileComponent)){
    (transitionInfo.transition as any).types.add('backwards')
  }
  else if(from?.component === FormComponentComponent){
    (transitionInfo.transition as any).types.add('login')
  }

}
