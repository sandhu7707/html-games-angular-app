import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .then(() => console.log(window))
  .catch((err) => console.error(err));

  // exportv localStorage = window.localStorage
  // export const IP_ADDR = process.env['IP_ADDR']