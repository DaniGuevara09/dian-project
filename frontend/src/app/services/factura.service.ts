import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnviarFacturaPayload, EnviarFacturaResponseDTO } from '../models/factura.model';

@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  private apiUrl = 'http://localhost:8080/api/factura';

  constructor(private http: HttpClient) {}

  procesarFactura(payload: EnviarFacturaPayload): Observable<EnviarFacturaResponseDTO> {
    return this.http.post<EnviarFacturaResponseDTO>(this.apiUrl, payload);
  }

  getDownloadUrl(pdfPath: string): string {
    if (!pdfPath) return '#';
    return `${this.apiUrl}/download?path=${encodeURIComponent(pdfPath)}`;
  }
}
