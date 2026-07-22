import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceHistoryItem } from '../../models/factura.model';

@Component({
  selector: 'app-graphic-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dian-modal-backdrop" *ngIf="visible && invoice" (click)="close()">
      <div class="dian-modal-card graphic-modal-card" (click)="$event.stopPropagation()">
        <div class="dian-modal-header">
          <div class="header-title-group">
            <div>
              <h3 class="modal-title-text">Factura Electrónica No. {{ invoice.numero }}</h3>
              <span class="sub-badge badge-info">Representación Gráfica Oficial</span>
            </div>
          </div>
          <button type="button" class="close-x" (click)="close()" aria-label="Cerrar">&times;</button>
        </div>

        <div class="graphic-modal-body">
          <div class="graphic-sheet" *ngIf="invoice">
            <div class="gov-bar-small">
              <div class="col-yellow"></div>
              <div class="col-blue"></div>
              <div class="col-red"></div>
            </div>

            <div class="sheet-header">
              <div class="sheet-logo">
                <span class="dian-logo-text">DIAN</span>
                <span class="dian-sub">Facturación Electrónica</span>
              </div>
              <div class="sheet-title">
                <h4>FACTURA ELECTRÓNICA DE VENTA</h4>
                <p class="num-text">No. <strong>{{ invoice.numero }}</strong></p>
                <p class="small-text">Fecha de Emisión: {{ invoice.fecha }}</p>
              </div>
            </div>

            <div class="sheet-grid">
              <div class="sheet-box">
                <h5>FACTURADOR ELECTRÓNICO (EMISOR)</h5>
                <p><strong>{{ invoice.vendedor }}</strong></p>
                <p>NIT: {{ invoice.nitVendedor }}</p>
                <p>Actividad: {{ invoice.actividadProductiva }}</p>
                <p>Tel: {{ invoice.telefonoVendedor }} | Email: {{ invoice.correoVendedor }}</p>
              </div>
              <div class="sheet-box">
                <h5>ADQUIRENTE (CLIENTE)</h5>
                <p><strong>{{ invoice.cliente }}</strong></p>
                <p>Identificación: {{ invoice.nitCliente }}</p>
                <p>Tel: {{ invoice.telefonoCliente }} | Email: {{ invoice.correoCliente }}</p>
              </div>
            </div>

            <table class="sheet-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción del Producto / Servicio</th>
                  <th class="text-center">Cant.</th>
                  <th class="text-right">Precio Unitario</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of invoice.items">
                  <td class="font-mono">{{ item.codigoProducto }}</td>
                  <td>{{ item.productoVendido }}</td>
                  <td class="text-center font-mono">{{ item.cantidadVendida }}</td>
                  <td class="text-right font-mono">{{ formatCOP(item.precioUnitario) }}</td>
                  <td class="text-right font-mono">{{ formatCOP(item.precioUnitario * item.cantidadVendida) }}</td>
                </tr>
              </tbody>
            </table>

            <div class="sheet-footer">
              <div class="cufe-box">
                <p class="cufe-label"><strong>Código Único de Factura Electrónica (CUFE):</strong></p>
                <p class="cufe-hash">{{ invoice.cufe }}</p>
                <p class="signed-badge">✓ DOCUMENTO FIRMADO DIGITALMENTE POR LA DIAN</p>
              </div>
              <div class="totals-box">
                <p class="totals-row"><span>Subtotal (Base):</span> <strong>{{ formatCOP(invoice.total / 1.19) }}</strong></p>
                <p class="totals-row"><span>IVA (19%):</span> <strong>{{ formatCOP(invoice.total - (invoice.total / 1.19)) }}</strong></p>
                <p class="grand-total"><span>Total Facturado:</span> <strong>{{ formatCOP(invoice.total) }}</strong></p>
              </div>
            </div>
          </div>
        </div>

        <div class="dian-modal-footer">
          <a *ngIf="invoice && invoice.pdfUrl" [href]="getDownloadUrl(invoice.pdfUrl)" target="_blank" class="btn-download-pdf">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Descargar Documento PDF
          </a>
          <button type="button" class="btn-modal-close" (click)="close()">Cerrar Previsualización</button>
        </div>
      </div>
    </div>
  `
})
export class GraphicModalComponent {
  @Input() visible = false;
  @Input() invoice: InvoiceHistoryItem | null = null;
  @Input() downloadUrlGetter?: (path: string) => string;

  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }

  formatCOP(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }

  getDownloadUrl(path: string): string {
    if (this.downloadUrlGetter) {
      return this.downloadUrlGetter(path);
    }
    return `http://localhost:8080/api/factura/download?path=${encodeURIComponent(path)}`;
  }
}
