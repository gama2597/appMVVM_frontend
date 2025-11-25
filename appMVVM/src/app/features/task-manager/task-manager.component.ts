import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';

// Servicios PrimeNG
import { MessageService, ConfirmationService } from 'primeng/api';
import { TaskService } from 'src/app/service/task.service';
import { Task } from 'src/app/model/task.model';

@Component({
  selector: 'app-task-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    ToolbarModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './task-manager.component.html',
  styleUrl: './task-manager.component.scss',
})
export class TaskManagerComponent implements OnInit {
  private taskService = inject(TaskService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  tasks: Task[] = [];
  isLoading: boolean = false; // Estado de carga

  taskDialog: boolean = false;
  currentTask: Task = { titulo: '', completado: false };
  isEditing: boolean = false;

  ngOnInit() {
    // PrimeNG maneja el SSR internamente, pero el llamado HTTP debe ser seguro
    this.loadTasks();
  }

  loadTasks() {
    this.isLoading = true;
    this.taskService.getAll().subscribe({
      next: (data) => {
        this.tasks = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        // Evitamos mostrar Toast si falla en el servidor (aunque withFetch lo evita)
        this.isLoading = false;
      },
    });
  }

  openNew() {
    this.currentTask = { titulo: '', completado: false };
    this.isEditing = false;
    this.taskDialog = true;
  }

  editTask(task: Task) {
    this.currentTask = { ...task };
    this.isEditing = true;
    this.taskDialog = true;
  }

  saveTask() {
    if (!this.currentTask.titulo.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cuidado',
        detail: 'Título requerido',
      });
      return;
    }

    this.isLoading = true;
    const request =
      this.isEditing && this.currentTask.id
        ? this.taskService.update(this.currentTask.id, this.currentTask)
        : this.taskService.create(this.currentTask);

    request.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Tarea guardada',
        });
        this.loadTasks();
        this.taskDialog = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Falló al guardar',
        });
        this.isLoading = false;
      },
    });
  }

  deleteTask(task: Task) {
    this.confirmationService.confirm({
      message: '¿Borrar ' + task.titulo + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.taskService.delete(task.id!).subscribe(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Borrado',
            detail: 'Tarea eliminada',
          });
          this.loadTasks();
        });
      },
    });
  }

  // Agrega estos métodos helpers
  getCompletedCount(): number {
    return this.tasks.filter((t) => t.completado).length;
  }

  getPendingCount(): number {
    return this.tasks.filter((t) => !t.completado).length;
  }
}
