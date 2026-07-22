package com.dian.factura.domain;

import org.springframework.stereotype.Component;

@Component
public class CufeGenerator {

    public String generarCufe(String idVendedor, String idCliente, double totalFactura, int totalItems) {
        String seed = idVendedor + "-" + idCliente + "-" + totalFactura + "-" + totalItems + "-DIAN-2026";
        StringBuilder cufe = new StringBuilder();
        String chars = "0123456789abcdef";
        for (int i = 0; i < 96; i++) {
            int idx = (seed.hashCode() + i * 7) & 0xf;
            cufe.append(chars.charAt(idx));
        }
        return cufe.toString();
    }
}
