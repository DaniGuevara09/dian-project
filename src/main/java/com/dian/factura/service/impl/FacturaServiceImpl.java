package com.dian.factura.service.impl;

import com.dian.factura.EnviarFacturaRequest;
import com.dian.factura.EnviarFacturaResponse;
import com.dian.factura.service.EmailService;
import com.dian.factura.service.FacturaService;
import com.dian.factura.service.PdfService;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
public class FacturaServiceImpl implements FacturaService {

    private final PdfService pdfService;
    private final EmailService emailService;

    public FacturaServiceImpl(PdfService pdfService, EmailService emailService) {
        this.pdfService = pdfService;
        this.emailService = emailService;
    }

    @Override
    public EnviarFacturaResponse procesarFactura(EnviarFacturaRequest request) {
        EnviarFacturaResponse response = new EnviarFacturaResponse();
        
        try {
            // 1. Generar la factura en PDF
            File pdfFile = pdfService.generarFacturaPdf(request);
            
            // 2. Enviar el correo electrónico adjuntando la factura
            emailService.enviarFacturaEmail(request.getCorreoCliente(), request.getNombreCliente(), pdfFile);
            
            // 3. Configurar respuesta exitosa
            response.setCodigo("200");
            response.setMensaje("Factura electrónica enviada y procesada exitosamente. Confirmación enviada a: " + request.getCorreoCliente());
            response.setPdfUrl(pdfFile.getAbsolutePath());
            
        } catch (Exception e) {
            response.setCodigo("500");
            response.setMensaje("Error en la facturación electrónica: " + e.getMessage());
            response.setPdfUrl(null);
        }
        
        return response;
    }
}
