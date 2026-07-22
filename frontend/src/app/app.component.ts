import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { FacturaService } from './services/factura.service';
import { AccessibilityService } from './services/accessibility.service';
import { AccessibilityMenuComponent } from './components/accessibility-menu/accessibility-menu.component';
import { DianModalComponent } from './components/dian-modal/dian-modal.component';
import { GraphicModalComponent } from './components/graphic-modal/graphic-modal.component';
import { EnviarFacturaPayload, ItemFacturaPayload, InvoiceHistoryItem } from './models/factura.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AccessibilityMenuComponent,
    DianModalComponent,
    GraphicModalComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  facturaForm!: FormGroup;
  isLoading = false;
  
  // Configuración del Sistema
  selectedEnvironment: 'testing' | 'production' = 'testing';
  operatorName = 'Dani';
  welcomeMessage = '';

  // Estado del modal de respuesta DIAN
  modalVisible = false;
  modalSuccess = false;
  modalTitle = '';
  modalMessage = '';
  modalDetails: any = null;

  // Estado del modal de Representación Gráfica Histórica
  graphicModalVisible = false;
  activeGraphicInvoice: InvoiceHistoryItem | null = null;

  // Historial de Invoices Transmitidas
  invoiceHistory: InvoiceHistoryItem[] = [];

  constructor(
    private fb: FormBuilder,
    private facturaService: FacturaService,
    public accessibilityService: AccessibilityService
  ) {}

  ngOnInit() {
    this.setWelcomeMessage();
    this.facturaForm = this.fb.group({
      // Datos del Vendedor (Emisor)
      identificacionVendedor: ['', [Validators.required, Validators.pattern(/^\d+(\.\d+)*-\d$/)]],
      nombreVendedor: ['', Validators.required],
      actividadProductiva: ['', Validators.required],
      telefonoVendedor: ['', [Validators.required, Validators.pattern(/^\d{7,10}$/)]],
      correoVendedor: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      
      // Datos del Cliente (Adquirente)
      nombreCliente: ['', Validators.required],
      identificacionCliente: ['', Validators.required],
      telefonoCliente: ['', [Validators.required, Validators.pattern(/^\d{7,10}$/)]],
      correoCliente: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],

      // FormArray dinámico para múltiples ítems
      items: this.fb.array([
        this.createItemGroup()
      ])
    });

    this.loadHistory();
  }

  get items(): FormArray {
    return this.facturaForm.get('items') as FormArray;
  }

  createItemGroup(codigo = '', producto = '', precio: number | null = null, cantidad = 1): FormGroup {
    return this.fb.group({
      codigoProducto: [codigo, Validators.required],
      productoVendido: [producto, Validators.required],
      precioUnitario: [precio, [Validators.required, Validators.min(0.01)]],
      cantidadVendida: [cantidad, [Validators.required, Validators.min(1)]]
    });
  }

  addItem() {
    this.items.push(this.createItemGroup());
  }

  removeItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  loadHistory() {
    try {
      const saved = localStorage.getItem('dian_invoice_history');
      if (saved) {
        this.invoiceHistory = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error al cargar historial', e);
    }
  }

  loadMockData() {
    this.facturaForm.patchValue({
      identificacionVendedor: '901.432.876-4',
      nombreVendedor: 'Soluciones de Software y Consultoría de Colombia S.A.S.',
      actividadProductiva: '6201 - Actividades de desarrollo de sistemas informáticos',
      telefonoVendedor: '6018765432',
      correoVendedor: 'contacto@sofcolombia.com.co',
      
      nombreCliente: 'Distribuciones Industriales del Caribe S.A.',
      identificacionCliente: '890.109.432-1',
      telefonoCliente: '6053123456',
      correoCliente: 'adquisiciones@districaribe.com'
    });

    this.items.clear();
    this.items.push(this.createItemGroup(
      'SERV-DIAN-2026',
      'Desarrollo e Integración de Módulo de Facturación Electrónica DIAN',
      4500000,
      1
    ));
    this.items.push(this.createItemGroup(
      'SUPP-CLOUD-01',
      'Soporte Técnico Especializado y Mantenimiento de Servidores Nube',
      850000,
      2
    ));
  }

  clearHistory() {
    this.invoiceHistory = [];
    localStorage.removeItem('dian_invoice_history');
  }

  get formVal() {
    return this.facturaForm.value;
  }

  get totalPreview(): number {
    const itemValues = this.items.value;
    return itemValues.reduce((sum: number, item: any) => {
      const p = parseFloat(item.precioUnitario) || 0;
      const c = parseInt(item.cantidadVendida, 10) || 0;
      return sum + (p * c);
    }, 0);
  }

  get subtotalPreview(): number {
    return this.totalPreview / 1.19;
  }

  get ivaPreview(): number {
    return this.totalPreview - this.subtotalPreview;
  }

  formatCOP(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.facturaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isItemFieldInvalid(index: number, fieldName: string): boolean {
    const itemGroup = this.items.at(index) as FormGroup;
    const field = itemGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  generateCUFE(payload: EnviarFacturaPayload): string {
    const seed = `${payload.identificacionVendedor}-${payload.identificacionCliente}-${payload.items.length}-${Date.now()}`;
    let hash = '';
    const chars = '0123456789abcdef';
    for (let i = 0; i < 96; i++) {
      const idx = (seed.charCodeAt(i % seed.length) + i * 7) % 16;
      hash += chars[idx];
    }
    return hash;
  }

  onSubmit() {
    if (this.facturaForm.invalid) {
      this.facturaForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const rawData = this.facturaForm.value;
    
    const formattedItems: ItemFacturaPayload[] = rawData.items.map((item: any) => ({
      codigoProducto: item.codigoProducto,
      productoVendido: item.productoVendido,
      precioUnitario: parseFloat(item.precioUnitario),
      cantidadVendida: parseInt(item.cantidadVendida, 10)
    }));

    const payload: EnviarFacturaPayload = {
      identificacionVendedor: rawData.identificacionVendedor,
      nombreVendedor: rawData.nombreVendedor,
      actividadProductiva: rawData.actividadProductiva,
      telefonoVendedor: rawData.telefonoVendedor,
      correoVendedor: rawData.correoVendedor,
      nombreCliente: rawData.nombreCliente,
      identificacionCliente: rawData.identificacionCliente,
      telefonoCliente: rawData.telefonoCliente,
      correoCliente: rawData.correoCliente,
      items: formattedItems
    };

    this.facturaService.procesarFactura(payload).subscribe({
      next: (result) => {
        this.isLoading = false;
        
        const generatedCufe = this.generateCUFE(payload);

        if (result.codigo === '200') {
          this.showModal(true, 'Emisión Institucional Exitosa', result.mensaje, result);
          
          if (result.pdfUrl) {
            window.open(this.facturaService.getDownloadUrl(result.pdfUrl), '_blank');
          }
          
          let invoiceNumber = 'FE-' + Math.floor(100000 + Math.random() * 900000);
          if (result.pdfUrl) {
            const match = result.pdfUrl.match(/Factura_(FE-\d+)\.pdf/i);
            if (match && match[1]) {
              invoiceNumber = match[1];
            }
          }

          const newInvoice: InvoiceHistoryItem = {
            numero: invoiceNumber,
            fecha: new Date().toLocaleString('es-CO'),
            vendedor: payload.nombreVendedor,
            nitVendedor: payload.identificacionVendedor,
            actividadProductiva: payload.actividadProductiva,
            telefonoVendedor: payload.telefonoVendedor,
            correoVendedor: payload.correoVendedor,
            
            cliente: payload.nombreCliente,
            nitCliente: payload.identificacionCliente,
            telefonoCliente: payload.telefonoCliente,
            correoCliente: payload.correoCliente,
            
            items: formattedItems,
            total: formattedItems.reduce((acc, item) => acc + (item.precioUnitario * item.cantidadVendida), 0),
            
            cufe: generatedCufe,
            pdfUrl: result.pdfUrl,
            xmlRequest: '',
            xmlResponse: '',
            estado: 'Recibido por DIAN'
          };

          this.invoiceHistory.unshift(newInvoice);
          localStorage.setItem('dian_invoice_history', JSON.stringify(this.invoiceHistory));

          this.facturaForm.reset({
            identificacionVendedor: payload.identificacionVendedor,
            nombreVendedor: payload.nombreVendedor,
            actividadProductiva: payload.actividadProductiva,
            telefonoVendedor: payload.telefonoVendedor,
            correoVendedor: payload.correoVendedor
          });

          this.items.clear();
          this.items.push(this.createItemGroup());
          
        } else {
          this.showModal(false, 'Fallo de Validación', result.mensaje || 'Error de procesamiento en la DIAN.', result);
        }
      },
      error: (err) => {
        this.isLoading = false;
        let errMsg = 'No se pudo establecer comunicación con el servidor de facturación.';
        if (err.error && err.error.mensaje) {
          errMsg = err.error.mensaje;
        } else if (err.message) {
          errMsg = err.message;
        }
        this.showModal(false, 'Error de Conexión', errMsg, err.error || null);
      }
    });
  }

  showModal(isSuccess: boolean, title: string, message: string, detailsObj: any) {
    this.modalSuccess = isSuccess;
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalDetails = detailsObj;
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
  }

  setWelcomeMessage() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.welcomeMessage = '¡Buenos días';
    } else if (hour < 18) {
      this.welcomeMessage = '¡Buenas tardes';
    } else {
      this.welcomeMessage = '¡Buenas noches';
    }
  }

  getDownloadUrl(pdfPath: string): string {
    return this.facturaService.getDownloadUrl(pdfPath);
  }

  openGraphicModal(invoice: InvoiceHistoryItem) {
    this.activeGraphicInvoice = invoice;
    this.graphicModalVisible = true;
  }

  closeGraphicModal() {
    this.graphicModalVisible = false;
    this.activeGraphicInvoice = null;
  }
}
