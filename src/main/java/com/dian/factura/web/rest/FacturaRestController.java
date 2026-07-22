package com.dian.factura.web.rest;

import com.dian.factura.EnviarFacturaRequest;
import com.dian.factura.EnviarFacturaResponse;
import com.dian.factura.service.FacturaService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;

@RestController
@RequestMapping("/api/factura")
public class FacturaRestController {

    private final FacturaService facturaService;

    public FacturaRestController(FacturaService facturaService) {
        this.facturaService = facturaService;
    }

    @PostMapping
    public ResponseEntity<EnviarFacturaResponse> procesarFactura(@RequestBody EnviarFacturaRequest request) {
        EnviarFacturaResponse response = facturaService.procesarFactura(request);
        if ("500".equals(response.getCodigo())) {
            return ResponseEntity.status(500).body(response);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/download")
    public ResponseEntity<Resource> descargarPdf(@RequestParam("path") String path) {
        try {
            File file = new File(path);
            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }
            Resource resource = new FileSystemResource(file);
            
            String filename = file.getName();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
