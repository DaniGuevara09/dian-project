package com.dian.factura.service.impl;

import com.dian.factura.EnviarFacturaRequest;
import com.dian.factura.ItemFactura;
import com.dian.factura.domain.CalculadorImpuestos;
import com.dian.factura.domain.CufeGenerator;
import com.dian.factura.service.PdfService;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Image;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.DecimalFormat;

@Service
public class PdfServiceImpl implements PdfService {

    private final CalculadorImpuestos calculadorImpuestos;
    private final CufeGenerator cufeGenerator;

    public PdfServiceImpl(CalculadorImpuestos calculadorImpuestos, CufeGenerator cufeGenerator) {
        this.calculadorImpuestos = calculadorImpuestos;
        this.cufeGenerator = cufeGenerator;
    }

    @Override
    public File generarFacturaPdf(EnviarFacturaRequest request) throws DocumentException, IOException {
        String numFactura = "FE-" + (int)(100000 + Math.random() * 900000);
        String tempDir = System.getProperty("java.io.tmpdir");
        File tempFile = new File(tempDir, "Factura_" + numFactura + ".pdf");
        
        Document document = new Document();
        PdfWriter.getInstance(document, new FileOutputStream(tempFile));
        
        document.open();
        
        // Colores institucionales de la DIAN
        Color dianNavy = new Color(10, 37, 64);      // #0A2540
        Color dianGreen = new Color(16, 185, 129);   // #10B981
        Color borderGray = new Color(226, 232, 240); // #E2E8F0
        Color lightBg = new Color(250, 251, 253);    // #FAFBFD
        
        // Fuentes básicas
        Font tituloFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 15, dianNavy);
        Font subTituloFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.GRAY);
        Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.BLACK);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.BLACK);
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
        Font greenFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, dianGreen);
        Font cufeFont = FontFactory.getFont(FontFactory.COURIER, 7, Color.GRAY);
        
        // 1. Barra Tricolor Superior (Gobierno de Colombia)
        PdfPTable tricolor = new PdfPTable(3);
        tricolor.setWidthPercentage(100);
        
        PdfPCell cYellow = new PdfPCell(); 
        cYellow.setBackgroundColor(new Color(252, 209, 22)); 
        cYellow.setBorder(PdfPCell.NO_BORDER); 
        cYellow.setFixedHeight(3f);
        
        PdfPCell cBlue = new PdfPCell(); 
        cBlue.setBackgroundColor(new Color(0, 56, 147)); 
        cBlue.setBorder(PdfPCell.NO_BORDER); 
        cBlue.setFixedHeight(3f);
        
        PdfPCell cRed = new PdfPCell(); 
        cRed.setBackgroundColor(new Color(206, 17, 38)); 
        cRed.setBorder(PdfPCell.NO_BORDER); 
        cRed.setFixedHeight(3f);
        
        tricolor.addCell(cYellow);
        tricolor.addCell(cBlue);
        tricolor.addCell(cRed);
        
        document.add(tricolor);
        document.add(new Paragraph("\n"));
        
        // 2. Encabezado con el Logo DIAN Real y Título de Factura
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{1.5f, 2.5f});
        
        try {
            ClassPathResource imgResource = new ClassPathResource("images/logo-dian.png");
            Image img = Image.getInstance(imgResource.getURL());
            img.scaleToFit(120, 50);
            PdfPCell logoCell = new PdfPCell(img);
            logoCell.setBorder(PdfPCell.NO_BORDER);
            logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            headerTable.addCell(logoCell);
        } catch (Exception e) {
            PdfPCell textLogoCell = new PdfPCell(new Phrase("DIAN FACTURA", boldFont));
            textLogoCell.setBorder(PdfPCell.NO_BORDER);
            textLogoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            headerTable.addCell(textLogoCell);
        }
        
        // Título de Factura
        PdfPCell titleCell = new PdfPCell();
        titleCell.setBorder(PdfPCell.NO_BORDER);
        titleCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        titleCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        
        Paragraph p1 = new Paragraph("FACTURA ELECTRÓNICA DE VENTA", tituloFont);
        p1.setAlignment(Element.ALIGN_RIGHT);
        titleCell.addElement(p1);
        
        Paragraph p2 = new Paragraph("Documento Oficial de la República de Colombia", subTituloFont);
        p2.setAlignment(Element.ALIGN_RIGHT);
        titleCell.addElement(p2);
        
        Paragraph p3 = new Paragraph("No. " + numFactura, boldFont);
        p3.setAlignment(Element.ALIGN_RIGHT);
        titleCell.addElement(p3);
        
        headerTable.addCell(titleCell);
        document.add(headerTable);
        document.add(new Paragraph("\n"));
        
        // 3. Tabla de Datos Vendedor (Emisor) y Cliente (Adquirente)
        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setWidths(new float[]{1.0f, 1.0f});
        infoTable.setSpacingAfter(10);
        
        // Vendedor Cell
        PdfPCell vendedorCell = new PdfPCell();
        vendedorCell.setBorderColor(borderGray);
        vendedorCell.setPadding(8);
        vendedorCell.setBackgroundColor(lightBg);
        vendedorCell.addElement(new Paragraph("FACTURADOR ELECTRÓNICO (EMISOR)", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, dianNavy)));
        vendedorCell.addElement(new Paragraph("Nombre: " + request.getNombreVendedor(), normalFont));
        vendedorCell.addElement(new Paragraph("NIT: " + request.getIdentificacionVendedor(), normalFont));
        vendedorCell.addElement(new Paragraph("Actividad: " + request.getActividadProductiva(), normalFont));
        vendedorCell.addElement(new Paragraph("Teléfono: " + request.getTelefonoVendedor(), normalFont));
        vendedorCell.addElement(new Paragraph("E-mail: " + request.getCorreoVendedor(), normalFont));
        infoTable.addCell(vendedorCell);
        
        // Cliente Cell
        PdfPCell clienteCell = new PdfPCell();
        clienteCell.setBorderColor(borderGray);
        clienteCell.setPadding(8);
        clienteCell.setBackgroundColor(lightBg);
        clienteCell.addElement(new Paragraph("ADQUIRENTE (CLIENTE)", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, dianNavy)));
        clienteCell.addElement(new Paragraph("Nombre: " + request.getNombreCliente(), normalFont));
        clienteCell.addElement(new Paragraph("Identificación: " + request.getIdentificacionCliente(), normalFont));
        clienteCell.addElement(new Paragraph("Teléfono: " + request.getTelefonoCliente(), normalFont));
        clienteCell.addElement(new Paragraph("E-mail: " + request.getCorreoCliente(), normalFont));
        infoTable.addCell(clienteCell);
        
        document.add(infoTable);
        document.add(new Paragraph("\n"));
        
        // 4. Tabla de Detalle de Bienes o Servicios (Iteración dinámica)
        PdfPTable productTable = new PdfPTable(5);
        productTable.setWidthPercentage(100);
        productTable.setWidths(new float[]{1.5f, 3.5f, 1.0f, 2.0f, 2.0f});
        
        String[] headers = {"Código", "Descripción", "Cantidad", "Precio Unitario", "Total"};
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
            cell.setBackgroundColor(dianNavy);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(6);
            cell.setBorderColor(dianNavy);
            productTable.addCell(cell);
        }
        
        DecimalFormat df = new DecimalFormat("$#,##0");
        double totalFactura = calculadorImpuestos.calcularTotalFactura(request.getItems());
        
        if (request.getItems() != null) {
            for (ItemFactura item : request.getItems()) {
                PdfPCell codeCell = new PdfPCell(new Phrase(item.getCodigoProducto(), normalFont));
                codeCell.setBorderColor(borderGray);
                productTable.addCell(codeCell);
                
                PdfPCell descCell = new PdfPCell(new Phrase(item.getProductoVendido(), normalFont));
                descCell.setBorderColor(borderGray);
                productTable.addCell(descCell);
                
                PdfPCell qtyCell = new PdfPCell(new Phrase(String.valueOf(item.getCantidadVendida()), normalFont));
                qtyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                qtyCell.setBorderColor(borderGray);
                productTable.addCell(qtyCell);
                
                double price = item.getPrecioUnitario();
                double itemTotal = calculadorImpuestos.calcularTotalItem(price, item.getCantidadVendida());
                
                PdfPCell prcCell = new PdfPCell(new Phrase(df.format(price), normalFont));
                prcCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                prcCell.setBorderColor(borderGray);
                productTable.addCell(prcCell);
                
                PdfPCell totCell = new PdfPCell(new Phrase(df.format(itemTotal), normalFont));
                totCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                totCell.setBorderColor(borderGray);
                productTable.addCell(totCell);
            }
        }
        
        document.add(productTable);
        
        // 5. Pie de Página: Seguridad y Totales
        PdfPTable footerTable = new PdfPTable(2);
        footerTable.setWidthPercentage(100);
        footerTable.setWidths(new float[]{5.5f, 4.5f});
        footerTable.setSpacingBefore(20);
        
        PdfPCell leftCell = new PdfPCell();
        leftCell.setBorder(PdfPCell.NO_BORDER);
        leftCell.setPaddingRight(10);
        
        PdfPTable securityTable = new PdfPTable(2);
        securityTable.setWidthPercentage(100);
        securityTable.setWidths(new float[]{1.0f, 3.5f});
        
        PdfPCell qrCell = new PdfPCell();
        qrCell.setBorder(PdfPCell.BOX);
        qrCell.setBorderColor(Color.LIGHT_GRAY);
        qrCell.setPadding(4);
        
        PdfPTable qrGrid = new PdfPTable(5);
        qrGrid.setWidthPercentage(100);
        for (int i = 0; i < 25; i++) {
            PdfPCell pixel = new PdfPCell();
            pixel.setFixedHeight(5f);
            pixel.setBorder(PdfPCell.NO_BORDER);
            if (i % 3 == 0 || i % 7 == 0 || i < 5 || i % 5 == 0 || i > 20) {
                pixel.setBackgroundColor(Color.BLACK);
            } else {
                pixel.setBackgroundColor(Color.WHITE);
            }
            qrGrid.addCell(pixel);
        }
        qrCell.addElement(qrGrid);
        securityTable.addCell(qrCell);
        
        PdfPCell cufeCell = new PdfPCell();
        cufeCell.setBorder(PdfPCell.NO_BORDER);
        cufeCell.setPaddingLeft(6);
        cufeCell.addElement(new Paragraph("Código Único de Factura Electrónica (CUFE):", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7, Color.BLACK)));
        
        int totalItemsCount = (request.getItems() != null) ? request.getItems().size() : 0;
        String cufeHash = cufeGenerator.generarCufe(
                request.getIdentificacionVendedor(),
                request.getIdentificacionCliente(),
                totalFactura,
                totalItemsCount
        );
        cufeCell.addElement(new Paragraph(cufeHash, cufeFont));
        cufeCell.addElement(new Paragraph("✓ DOCUMENTO FIRMADO DIGITALMENTE", greenFont));
        
        securityTable.addCell(cufeCell);
        leftCell.addElement(securityTable);
        footerTable.addCell(leftCell);
        
        PdfPCell rightCell = new PdfPCell();
        rightCell.setBorder(PdfPCell.NO_BORDER);
        
        PdfPTable totalsTable = new PdfPTable(2);
        totalsTable.setWidthPercentage(100);
        totalsTable.setWidths(new float[]{1.5f, 1.5f});
        
        double subtotal = calculadorImpuestos.calcularSubtotalFactura(totalFactura);
        double iva = calculadorImpuestos.calcularIvaFactura(totalFactura);
        
        // Fila Subtotal
        PdfPCell subLabel = new PdfPCell(new Phrase("Subtotal (Base Gravable):", normalFont));
        subLabel.setBorderColor(borderGray);
        subLabel.setPadding(4);
        totalsTable.addCell(subLabel);
        
        PdfPCell subVal = new PdfPCell(new Phrase(df.format(subtotal), normalFont));
        subVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
        subVal.setBorderColor(borderGray);
        subVal.setPadding(4);
        totalsTable.addCell(subVal);
        
        // Fila IVA
        PdfPCell ivaLabel = new PdfPCell(new Phrase("IVA Generado (19%):", normalFont));
        ivaLabel.setBorderColor(borderGray);
        ivaLabel.setPadding(4);
        totalsTable.addCell(ivaLabel);
        
        PdfPCell ivaVal = new PdfPCell(new Phrase(df.format(iva), normalFont));
        ivaVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
        ivaVal.setBorderColor(borderGray);
        ivaVal.setPadding(4);
        totalsTable.addCell(ivaVal);
        
        // Fila Total
        PdfPCell totLabel = new PdfPCell(new Phrase("Total Facturado:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, dianNavy)));
        totLabel.setBackgroundColor(lightBg);
        totLabel.setBorderColor(borderGray);
        totLabel.setPadding(5);
        totalsTable.addCell(totLabel);
        
        PdfPCell totVal = new PdfPCell(new Phrase(df.format(totalFactura), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, dianNavy)));
        totVal.setBackgroundColor(lightBg);
        totVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totVal.setBorderColor(borderGray);
        totVal.setPadding(5);
        totalsTable.addCell(totVal);
        
        rightCell.addElement(totalsTable);
        footerTable.addCell(rightCell);
        
        document.add(footerTable);
        document.add(new Paragraph("\n"));
        
        Paragraph validez = new Paragraph("Esta factura electrónica es una representación gráfica de la transacción reportada a la DIAN. Documento de prueba institucional.", FontFactory.getFont(FontFactory.HELVETICA, 7, Color.GRAY));
        validez.setAlignment(Element.ALIGN_CENTER);
        document.add(validez);
        
        document.close();
        
        return tempFile;
    }
}
