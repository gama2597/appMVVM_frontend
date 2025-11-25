import {APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http'; // <--- withFetch es CLAVE para SSR
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { primengConfigFactory } from './primeng-translation';
import { PrimeNGConfig } from 'primeng/api';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()), // Usa la API Fetch nativa de Node.js
    provideAnimationsAsync(), // Animaciones de PrimeNG
    {
      provide: APP_INITIALIZER,
      useFactory: initializePrimeNGConfig,
      deps: [PrimeNGConfig],
      multi: true
    },
    { provide: PrimeNGConfig, useClass: PrimeNGConfig }
  ]
};

function initializePrimeNGConfig(primengConfig: PrimeNGConfig): () => void {
  return () => {
    const config = primengConfigFactory();
    Object.assign(primengConfig, config);
  };
}
