package com.dian.factura.domain;

import com.dian.factura.ItemFactura;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CalculadorImpuestos {

    private static final double TASA_IVA = 0.19;

    public double calcularTotalItem(double precioUnitario, int cantidad) {
        return precioUnitario * cantidad;
    }

    public double calcularTotalFactura(List<ItemFactura> items) {
        if (items == null || items.isEmpty()) return 0.0;
        return items.stream()
                .mapToDouble(item -> calcularTotalItem(item.getPrecioUnitario(), item.getCantidadVendida()))
                .sum();
    }

    public double calcularSubtotalFactura(double total) {
        return total / (1.0 + TASA_IVA);
    }

    public double calcularIvaFactura(double total) {
        return total - calcularSubtotalFactura(total);
    }
}
