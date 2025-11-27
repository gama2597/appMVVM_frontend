import { Component } from '@angular/core';
import { TareaManagerComponent } from './features/tarea-manager/tarea-manager.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TareaManagerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'appMVVM';
}
