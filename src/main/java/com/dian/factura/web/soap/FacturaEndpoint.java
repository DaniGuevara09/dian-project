package com.dian.factura.web.soap;

import com.dian.factura.EnviarFacturaRequest;
import com.dian.factura.EnviarFacturaResponse;
import com.dian.factura.service.FacturaService;
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;

@Endpoint
public class FacturaEndpoint {

    private static final String NAMESPACE_URI = "http://www.dian.com/factura";

    private final FacturaService facturaService;

    public FacturaEndpoint(FacturaService facturaService) {
        this.facturaService = facturaService;
    }

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "EnviarFacturaRequest")
    @ResponsePayload
    public EnviarFacturaResponse enviarFactura(@RequestPayload EnviarFacturaRequest request) {
        return facturaService.procesarFactura(request);
    }
}
