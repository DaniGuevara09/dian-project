export interface ItemFacturaPayload {
  codigoProducto: string;
  productoVendido: string;
  cantidadVendida: number;
  precioUnitario: number;
}

export interface EnviarFacturaPayload {
  identificacionVendedor: string;
  nombreVendedor: string;
  actividadProductiva: string;
  telefonoVendedor: string;
  correoVendedor: string;
  nombreCliente: string;
  identificacionCliente: string;
  telefonoCliente: string;
  correoCliente: string;
  items: ItemFacturaPayload[];
}

export interface EnviarFacturaResponseDTO {
  codigo: string;
  mensaje: string;
  pdfUrl?: string;
}

export interface InvoiceHistoryItem {
  numero: string;
  fecha: string;
  vendedor: string;
  nitVendedor: string;
  actividadProductiva: string;
  telefonoVendedor: string;
  correoVendedor: string;
  cliente: string;
  nitCliente: string;
  telefonoCliente: string;
  correoCliente: string;
  items: ItemFacturaPayload[];
  total: number;
  cufe: string;
  pdfUrl?: string;
  xmlRequest: string;
  xmlResponse: string;
  estado: string;
}

export interface AccessibilitySettings {
  isHighContrast: boolean;
  isGrayscale: boolean;
  fontSize: 'normal' | 'medium' | 'large';
  isUnderlinedLinks: boolean;
  isTextSpacing: boolean;
  isEnhancedFocus: boolean;
}
