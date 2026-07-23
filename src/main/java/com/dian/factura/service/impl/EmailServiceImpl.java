package com.dian.factura.service.impl;

import com.dian.factura.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final String senderEmail;

    public EmailServiceImpl(JavaMailSender mailSender, @Value("${spring.mail.username:lauradanielaguevara09@gmail.com}") String senderEmail) {
        this.mailSender = mailSender;
        this.senderEmail = senderEmail;
    }

    @Override
    @Async
    public void enviarFacturaEmail(String correoDestinatario, String nombreCliente, File pdfAdjunto) {
        try {
            System.out.println(">>> INICIANDO ENVÍO DE CORREO SMTP EN SEGUNDO PLANO...");
            System.out.println("Destinatario: " + correoDestinatario);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(senderEmail);
            helper.setTo(correoDestinatario);
            helper.setSubject("DIAN - Confirmación de Envío de Factura Electrónica");
            
            String cuerpoHtml = "<h3>Estimado(a) " + nombreCliente + ",</h3>"
                    + "<p>Nos complace informarle que se ha generado y transmitido exitosamente su factura electrónica de venta a la DIAN.</p>"
                    + "<p>Adjunto a este correo encontrará la representación gráfica oficial (PDF) de su factura.</p>"
                    + "<br/>"
                    + "<p><i>Este correo ha sido generado de manera automática, por favor no responda a este mensaje.</i></p>"
                    + "<hr/>"
                    + "<p><b>Dirección de Impuestos y Aduanas Nacionales - DIAN</b></p>";
                    
            helper.setText(cuerpoHtml, true);
            
            if (pdfAdjunto != null && pdfAdjunto.exists()) {
                FileSystemResource file = new FileSystemResource(pdfAdjunto);
                helper.addAttachment(pdfAdjunto.getName(), file);
            }
            
            mailSender.send(message);
            System.out.println(">>> CORREO ENVIADO EXITOSAMENTE A: " + correoDestinatario);
            
        } catch (Exception e) {
            System.err.println(">>> ALERTA SMTP: No se pudo entregar el correo (" + e.getMessage() + ")");
        }
    }
}
