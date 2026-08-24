# Proyecto: Tienda web Giorenatto

Tienda online de **Giorenatto**, marca argentina de ropa de bebé y primera infancia
(Ezpeleta, Buenos Aires). Este paquete contiene la web actual para que la continúes.

## Estado actual

Es una tienda estática (HTML + CSS + JS en un solo archivo, sin backend). Funciona
100% del lado del cliente, no requiere servidor para verse. El "checkout" arma un
mensaje con el pedido y lo abre en WhatsApp — NO hay pago online integrado todavía.

### Qué YA tiene
- Catálogo de 30 productos organizados por categoría (datos embebidos en el JS).
- Carrito funcional: agregar/quitar, cantidades, total, respeta el stock de cada producto.
- Buscador de productos por nombre/categoría.
- Filtro por talle.
- Vista de producto ampliada (modal al tocar una tarjeta).
- Sección de destacados.
- Sección "Cómo comprar" (4 pasos).
- Banner de promoción (texto editable).
- Botón flotante de WhatsApp + íconos de WhatsApp e Instagram (SVG).
- Diseño responsive (mobile-first friendly), estética minimalista con la paleta del logo.

### Datos de contacto ya configurados
- WhatsApp: `5491162705378` (constante `WHATSAPP` en el JS + `waConsulta()`).
- Instagram: `https://www.instagram.com/giorenatto`

## Archivos

- `index.html` — la web. Logo referenciado como archivo externo (`logo.jpg`).
  Mantené `index.html` y `logo.jpg` en la misma carpeta.
- `logo.jpg` — logo de Giorenatto (osito con overol).
- `catalogo_giorenatto.xlsx` — fuente de datos del catálogo (costo, precio de venta,
  stock, markup). NOTA: la columna de costo/margen es interna, NO debe exponerse en la web.
- Los datos que consume la web están en el array `PRODUCTOS` dentro del `<script>` de
  `index.html`. Si cambian precios/stock, se editan ahí (o se regeneran desde el xlsx).

## Paleta (colores del logo)
- Marrón osito: `#c9a57f` / oscuro `#a9835f` / profundo `#7d5f42`
- Verde salvia: `#9caf88`
- Celeste overol: `#a8b8c8`
- Rosa: `#e3969a`
- Crema fondo: `#fbfaf7`

## Próximos pasos sugeridos (lo que falta)

1. **Fotos reales de los productos.** Hoy cada producto muestra un emoji por categoría.
   Reemplazar por fotos reales es la mejora de mayor impacto. En el JS, cada producto
   podría tener un campo `img` con la ruta/URL de su foto, y las tarjetas (`cardHTML`) y
   el modal (`abrirModal`) usar esa imagen en lugar del emoji de `ICONOS`.

2. **Pago online real con Mercado Pago.** Requiere backend (no es posible en HTML estático).
   Opciones:
   - Integrar Checkout Pro / API de Mercado Pago con un backend propio (Node, etc.).
   - O migrar la tienda a una plataforma (Tiendanube / Empretienda) que ya trae MP integrado.
   El dueño valoró usar plataforma para el pago real; este HTML sirve como referencia de diseño.

3. **Publicar online.** Al ser estática, se puede subir tal cual a Vercel, Netlify o
   GitHub Pages (gratis). Solo hay que subir `index.html` + `logo.jpg`.

4. **Conectar stock dinámico.** Hoy el stock está hardcodeado en el JS. Se podría leer
   desde una fuente viva (Google Sheets API) para no editar el código en cada cambio.

5. **Completar:** links de Facebook (si tiene), y ajustar el texto del banner de promo
   a la promo real vigente.

## Contexto extra
El dueño también está armando un bot de atención por WhatsApp (sub-agente "vendedor" en
OpenClaw con DeepSeek) que usa el mismo catálogo. La web y el bot comparten la misma
fuente de verdad de productos/precios/stock.
