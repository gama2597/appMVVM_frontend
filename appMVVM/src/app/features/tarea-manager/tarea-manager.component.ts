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
import { TareaService } from 'src/app/service/tarea.service';
import { Tarea } from 'src/app/model/tareas.model';

@Component({
  selector: 'app-tarea-manager',
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
  templateUrl: './tarea-manager.component.html',
  styleUrl: './tarea-manager.component.scss',
})
export class TareaManagerComponent implements OnInit {
  private tareaService = inject(TareaService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  tareas: Tarea[] = [];
  isLoading: boolean = false; // Estado de carga

  tareaDialog: boolean = false;
  tareaActual: Tarea = { titulo: '', completado: false };
  isEditing: boolean = false;

  ngOnInit() {
    // PrimeNG maneja el SSR internamente, pero el llamado HTTP debe ser seguro
    this.loadTasks();
  }

  loadTasks() {
    this.isLoading = true;
    this.tareaService.getAll().subscribe({
      next: (data) => {
        this.tareas = data;
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
    this.tareaActual = { titulo: '', completado: false };
    this.isEditing = false;
    this.tareaDialog = true;
  }

  editTask(tarea: Tarea) {
    this.tareaActual = { ...tarea };
    this.isEditing = true;
    this.tareaDialog = true;
  }

  saveTask() {
    if (!this.tareaActual.titulo.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cuidado',
        detail: 'Título requerido',
      });
      return;
    }

    this.isLoading = true;
    const request =
      this.isEditing && this.tareaActual.id
        ? this.tareaService.update(this.tareaActual.id, this.tareaActual)
        : this.tareaService.create(this.tareaActual);

    request.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Tarea guardada',
        });
        this.loadTasks();
        this.tareaDialog = false;
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

  deleteTask(tarea: Tarea) {
    this.confirmationService.confirm({
      message: '¿Borrar ' + tarea.titulo + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.tareaService.delete(tarea.id!).subscribe(() => {
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
    return this.tareas.filter((t) => t.completado).length;
  }

  getPendingCount(): number {
    return this.tareas.filter((t) => !t.completado).length;
  }
}
