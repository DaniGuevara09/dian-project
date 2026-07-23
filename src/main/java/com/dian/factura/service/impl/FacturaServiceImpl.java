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
            System.out.println(">>> PASO 1: Iniciando generación de PDF de factura...");
            File pdfFile = pdfService.generarFacturaPdf(request);
            System.out.println(">>> PASO 2: PDF generado exitosamente en: " + pdfFile.getAbsolutePath());
            
            System.out.println(">>> PASO 3: Solicitando envío de correo a EmailService para: " + request.getCorreoCliente());
            emailService.enviarFacturaEmail(request.getCorreoCliente(), request.getNombreCliente(), pdfFile);
            
            response.setCodigo("200");
            response.setMensaje("Factura electrónica enviada y procesada exitosamente. Confirmación enviada a: " + request.getCorreoCliente());
            response.setPdfUrl(pdfFile.getAbsolutePath());
            
        } catch (Exception e) {
            System.err.println(">>> ERROR EN PROCESAR FACTURA: " + e.getMessage());
            e.printStackTrace();
            response.setCodigo("500");
            response.setMensaje("Error en la facturación electrónica: " + e.getMessage());
            response.setPdfUrl(null);
        }
        
        return response;
    }
}
