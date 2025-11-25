import { Component } from '@angular/core';
import { TaskManagerComponent } from './features/task-manager/task-manager.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TaskManagerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'appMVVM';
}
