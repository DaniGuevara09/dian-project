package com.dian.factura.service;

import jakarta.mail.MessagingException;
import java.io.File;

public interface EmailService {
    void enviarFacturaEmail(String correoDestinatario, String nombreCliente, File pdfAdjunto) throws MessagingException;
}
