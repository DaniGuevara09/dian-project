package com.dian.factura.service;

import com.dian.factura.EnviarFacturaRequest;
import com.dian.factura.EnviarFacturaResponse;

public interface FacturaService {
    EnviarFacturaResponse procesarFactura(EnviarFacturaRequest request);
}
