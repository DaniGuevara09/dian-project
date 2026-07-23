import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dian-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dian-modal-backdrop" *ngIf="visible" (click)="close()">
      <div class="dian-modal-card" (click)="$event.stopPropagation()">
        <div class="dian-modal-header">
          <div class="header-title-group">
            <div class="header-icon" [class.icon-success]="isSuccess" [class.icon-error]="!isSuccess">
              <svg *ngIf="isSuccess" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              <svg *ngIf="!isSuccess" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <div>
              <h3 class="modal-title-text">{{ isSuccess ? '¡Factura Emitida Exitosamente!' : 'No se pudo procesar la factura' }}</h3>
              <span class="sub-badge" [class.badge-success]="isSuccess" [class.badge-error]="!isSuccess">
                {{ isSuccess ? 'Transmisión confirmada' : 'Atención requerida' }}
              </span>
            </div>
          </div>
          <button type="button" class="close-x" (click)="close()" aria-label="Cerrar">&times;</button>
        </div>

        <div class="dian-modal-body">
          <div class="user-message-card" [class.card-success]="isSuccess" [class.card-error]="!isSuccess">
            <p class="user-message-text">{{ getFriendlyMessage() }}</p>
          </div>

          <div class="info-row" *ngIf="isSuccess && details?.codigo">
            <span class="info-label">Estado de Validación:</span>
            <span class="info-value">Aprobado y Registrado</span>
          </div>

          <div class="response-actions" *ngIf="isSuccess && details?.pdfUrl">
            <a [href]="getDownloadUrl(details.pdfUrl)" target="_blank" class="btn-download-pdf">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Guardar Factura PDF
            </a>
          </div>
        </div>

        <div class="dian-modal-footer">
          <button type="button" class="btn-modal-close" (click)="close()">Entendido / Cerrar</button>
        </div>
      </div>
    </div>
  `
})
export class DianModalComponent {
  @Input() visible = false;
  @Input() isSuccess = false;
  @Input() title = '';
  @Input() message = '';
  @Input() details: any = null;
  @Input() downloadUrlGetter?: (path: string) => string;

  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }

  getFriendlyMessage(): string {
    if (this.isSuccess) {
      return 'La factura electrónica de venta ha sido procesada, firmada digitalmente y enviada exitosamente al correo electrónico del cliente. Puedes descargar y guardar el documento en PDF si lo deseas.';
    }
    
    if (this.message && !this.message.includes('Exception') && !this.message.includes('SOAP') && !this.message.includes('500') && !this.message.includes('200')) {
      return this.message;
    }
    
    return 'Ocurrió un inconveniente al intentar emitir la factura electrónica. Por favor, verifica que los datos del emisor y del cliente estén correctamente diligenciados e inténtalo nuevamente.';
  }

  getDownloadUrl(path: string): string {
    if (this.downloadUrlGetter) {
      return this.downloadUrlGetter(path);
    }
    return `https://dian-project-vvq8.onrender.com/api/factura/download?path=${encodeURIComponent(path)}`;
  }
}
