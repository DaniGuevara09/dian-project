package com.dian.factura.service;

import com.dian.factura.EnviarFacturaRequest;
import com.lowagie.text.DocumentException;

import java.io.File;
import java.io.IOException;

public interface PdfService {
    File generarFacturaPdf(EnviarFacturaRequest request) throws DocumentException, IOException;
}
