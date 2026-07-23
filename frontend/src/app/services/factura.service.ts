import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnviarFacturaPayload, EnviarFacturaResponseDTO } from '../models/factura.model';

@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  private baseUrl = 'https://dian-project-vvq8.onrender.com/api/factura';

  constructor(private http: HttpClient) { }

  procesarFactura(payload: EnviarFacturaPayload): Observable<EnviarFacturaResponseDTO> {
    return this.http.post<EnviarFacturaResponseDTO>(this.baseUrl, payload);
  }

  getDownloadUrl(pdfPath: string): string {
    if (!pdfPath) return '#';
    return `${this.baseUrl}/download?path=${encodeURIComponent(pdfPath)}`;
  }
}
