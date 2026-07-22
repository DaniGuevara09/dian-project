# Bitácora de Errores - Emisión de Factura Electrónica (DIAN)

Este documento contiene la recopilación y documentación de errores comunes, su explicación técnica, y los mecanismos de mitigación implementados en el sistema de facturación electrónica SOAP.

---

## 1. Error de Servidor de Correo (SMTP / Envío de Email)

### Descripción del Fallo
Ocurre cuando el servicio `EmailService` intenta enviar la factura en formato PDF y el servidor de correo configurado rechaza la conexión o falla la autenticación.

### Mensaje de Error Típico
```
org.springframework.mail.MailAuthenticationException: Authentication failed; nested exception is jakarta.mail.AuthenticationFailedException: 535-5.7.8 Username and Password not accepted.
```

### Causa Común
*   Credenciales SMTP incorrectas en el archivo `application.properties`.
*   Para cuentas de Gmail, intentar usar la contraseña estándar de la cuenta sin activar la autenticación de dos factores y sin usar una **Contraseña de Aplicación**.
*   Bloqueo de puertos (puerto `587` o `465`) por parte del firewall de la red o del ISP.

### Solución / Mitigación
1.  **Contraseña de Aplicación**: En la configuración de tu cuenta de Google, ve a seguridad y genera una contraseña dedicada para aplicaciones externas. Reemplaza el parámetro `spring.mail.password` con este código de 16 caracteres.
2.  **Verificación de Puertos**: Asegurar que las propiedades de autenticación y TLS estén configuradas correctamente en `application.properties`:
    ```properties
    spring.mail.properties.mail.smtp.auth=true
    spring.mail.properties.mail.smtp.starttls.enable=true
    ```

---

## 2. Ruta Inválida o Recurso No Encontrado (Logo de la DIAN)

### Descripción del Fallo
Ocurre cuando `PdfService` intenta cargar el logotipo oficial de la DIAN para renderizarlo dentro del documento PDF, y la ruta física o del classpath especificada es incorrecta.

### Mensaje de Error Típico
```
java.io.FileNotFoundException: class path resource [static/images/logo-dian.png] cannot be opened because it does not exist
```

### Causa Común
*   El archivo de imagen no está ubicado exactamente en la ruta `src/main/resources/static/images/logo-dian.png`.
*   El nombre del archivo tiene diferencias de mayúsculas/minúsculas (sensible al entorno de ejecución en Linux/Unix al empaquetar en JAR).
*   No haber actualizado los recursos cargados antes de iniciar el servidor.

### Solución / Mitigación
1.  **Estructura de Carpetas**: Asegurar que el archivo exista en `src/main/resources/static/images/logo-dian.png`.
2.  **Manejo Defensivo de Excepciones**: En `PdfService.java` se implementó un bloque `try-catch` que encierra la lectura física del archivo. Si la imagen falla en cargarse, la generación de la factura no se interrumpe; en su lugar, se añade un contenedor de texto alternativo (`"DIAN LOGO"`) en la cabecera del PDF:
    ```java
    try {
        ClassPathResource imgResource = new ClassPathResource("static/images/logo-dian.png");
        Image img = Image.getInstance(imgResource.getURL());
        // ... añadir celda del logo
    } catch (Exception e) {
        PdfPCell textLogoCell = new PdfPCell(new Phrase("DIAN LOGO", boldFont));
        // ... añadir texto alternativo
    }
    ```

---

## 3. Incoherencias en Cálculos Aritméticos (Valores Negativos o Nulos)

### Descripción del Fallo
Ocurre cuando un cliente o un vendedor malintencionado intenta emitir una factura electrónica con valores de producto negativos o cantidades en cero para simular cobros indebidos.

### Causa Común
*   Falta de validación a nivel de modelo o de base de datos que permite la multiplicación:
    $$\text{Total} = \text{cantidadVendida} \times \text{precioUnitario}$$
    Si la cantidad es `-5` y el precio unitario es `$10.000`, el total de la venta resultante será de `-$50.000`.

### Solución / Mitigación
1.  **Restricciones de Esquema XML (XSD)**: En [factura.xsd](file:///c:/Users/Dani/Desktop/Uni/ElectiveII/Workshop/factura/src/main/resources/xsd/factura.xsd) se definieron tipos restrictivos especiales que impiden recibir este tipo de peticiones a nivel de protocolo SOAP:
    *   `PositiveDouble`: Restringe el `precioUnitario` a ser mayor exclusivo a `0.0`.
    *   `PositiveInt`: Restringe la `cantidadVendida` a ser mayor o igual inclusivo a `1`.
    ```xml
    <xs:simpleType name="PositiveDouble">
        <xs:restriction base="xs:double">
            <xs:minExclusive value="0.0"/>
        </xs:restriction>
    </xs:simpleType>
    ```
2.  **Validación del Servidor (Validating Interceptor)**: Spring Web Services valida la estructura XML entrante contra el XSD mediante el bean `PayloadValidatingInterceptor` declarado en `WebServiceConfig.java`. Si el cliente envía un valor negativo, el servidor rechaza automáticamente la petición y devuelve un **SOAP Fault** describiendo la falla de validación antes de ejecutar la lógica de negocio.

---

## 4. Respuestas Fallidas y Mapeo Global (SOAP Faults)

### Descripción del Fallo
Ocurre cuando el backend experimenta fallas en tiempo de ejecución no controladas. Si no se manejan de manera apropiada, la respuesta es una traza HTTP 500 plana que expone código interno y rompe el protocolo SOAP.

### Solución / Mitigación
1.  **SoapFaultMappingExceptionResolver**: Declarado en `WebServiceConfig.java`. Mapea todas las excepciones generales (`Exception.class`) a un estado `SERVER` (error del servidor) y las de tipo `IllegalArgumentException` a un estado `CLIENT` (error del cliente).
2.  El resolver genera de manera dinámica un elemento estructurado XML en el cuerpo de la respuesta SOAP:
    ```xml
    <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
       <SOAP-ENV:Body>
          <SOAP-ENV:Fault>
             <faultcode>SOAP-ENV:Server</faultcode>
             <faultstring>Error en la facturación electrónica: [Detalle del Error]</faultstring>
          </SOAP-ENV:Fault>
       </SOAP-ENV:Body>
    </SOAP-ENV:Envelope>
    ```

---

## 5. Fallo de Remitente SMTP en Servidores Estrictos (Outlook / Office365)

### Descripción del Fallo
Ocurre cuando la aplicación intenta enviar un correo asíncrono y, aunque las credenciales de host, usuario y contraseña son correctas, el servidor de correo rechaza la transmisión.

### Mensaje de Error Típico
```
org.springframework.mail.MailSendException: Failed to send email; nested exception is jakarta.mail.SendFailedException: 554 5.2.250 SendAsDenied; not allowed to send as...
```

### Causa Común
Los proveedores como Outlook/Office365 o Gmail (en servidores SMTP reales) prohíben que una aplicación envíe correos con un remitente vacío o diferente del correo autenticado para evitar el spam y la suplantación. Si no se llama explícitamente a `helper.setFrom()`, el envío falla de forma silenciosa en segundo plano.

### Solución / Mitigación
Inyectar el usuario autenticado desde `application.properties` en `EmailService.java` usando `@Value` y configurar explícitamente el remitente:
```java
@Value("${spring.mail.username}")
private String senderEmail;

// ...
helper.setFrom(senderEmail);
```

---

## 6. Desalineación de Elementos Fijos al Aplicar Filtros CSS (Monocromo)

### Descripción del Fallo
Al activar el modo de accesibilidad monocromático (escala de grises), la pestaña flotante de ajustes se movía de su posición fija en el centro-derecha y caía al final de la página web al hacer scroll.

### Causa Técnica
Según el estándar de hojas de estilo CSS, al aplicar un filtro (`filter: grayscale(...)`) al elemento `body` o `html`, el navegador crea un nuevo **bloque de contención** (containing block) para todos los elementos descendientes con posicionamiento fijo (`position: fixed`). Esto hace que se comporten como `position: absolute` relativos al cuerpo en vez de a la ventana del navegador.

### Solución / Mitigación
En [styles.css](file:///c:/Users/Dani/Desktop/Uni/ElectiveII/Workshop/factura/frontend/src/styles.css), se limitó el alcance del filtro CSS únicamente a los contenedores principales de contenido del sitio, excluyendo el menú flotante:
```css
body.accessibility-grayscale .app-container,
body.accessibility-grayscale .main-header,
body.accessibility-grayscale .gov-co-bar,
body.accessibility-grayscale .dian-modal-backdrop {
  filter: grayscale(100%) !important;
}
```
Esto soluciona el bug de scroll y además mantiene el panel de accesibilidad a color completo para que el usuario distinga claramente sus selecciones.

