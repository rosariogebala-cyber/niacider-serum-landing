# NIACIDER Serum · Landing de producto

Landing comercial de **NIACIDER Serum** (Laboratorios Cassará), con Niacinamida 10% y Ácido Hialurónico HySilk®.
Es un sitio estático, listo para subir a cualquier hosting (Apache, Nginx, Netlify, S3 o CDN), sin build obligatorio.

## Estructura

```
index.html                  Página única (HTML5 semántico)
robots.txt · sitemap.xml    SEO técnico
favicon.ico · favicon-32.png · apple-touch-icon.png
assets/
  css/styles.css            Estilos propios (tokens, componentes, secciones, motion)
  js/main.js                Comportamiento (header, nav accesible, tabs, GSAP)
  images/                   WebP + AVIF con nombres descriptivos y varios tamaños
  fonts/                    Montserrat variable (latin) + Midnight Drive (subset)
  vendor/bootstrap/         Bootstrap 5.3.9 a medida (purgado) + bootstrap.min.js
  vendor/gsap/              GSAP 3.15.1 + ScrollTrigger
src/scss/bootstrap-custom.scss   Fuente del build de Bootstrap (solo los módulos usados)
purgecss.config.cjs · package.json   Herramientas de build y validación (opcionales)
```

## Dirección creativa: "Ciencia que se siente"

- **Estilo:** editorial clínico, sobre blanco porcelana y rosa piel, con la textura de hexágonos y burbujas de las piezas impresas.
- **Tipografía:** Montserrat con alternancia de pesos 800 y 300, igual que en el aviso. La manuscrita (Midnight Drive) se usa solo en "Inspirado en la piel".
- **Profundidad:** un "10%" gigante detrás del frasco y un parallax suave.
- **Color:**
  - Turquesa de marca `#35B5BF`, solo para lo decorativo.
  - Turquesa de texto `#1F8F99` para títulos grandes y `#0F7680` para texto normal y botones, para cumplir contraste AA.
  - Azul noche `#00426D`.
  - Ámbar y rosa de las moléculas como nota cálida.
- **Narrativa:** Hero → Beneficios → Producto → Fórmula (selector de activos) → Ciencia + lifestyle → Mañana y noche → Tipos de piel → FAQ → CTA.
- **Sin prueba social inventada:** no hay testimonios, estudios ni cifras. Todo el contenido sale de los materiales de marca (díptico, versión para celular, aviso y la presentación LITE).

## Publicación

GitHub Pages: rama `main`, carpeta raíz (`/`). Cada push a `main` se publica solo en 1 o 2 minutos.

## Uso local

```bash
npx serve .          # o cualquier servidor estático
```

## Build opcional (solo si se cambia Bootstrap o se actualizan dependencias)

```bash
npm install
npm run build:bootstrap   # compila src/scss/bootstrap-custom.scss y purga lo no usado
npm run copy:vendor       # copia bootstrap.min.js, gsap y ScrollTrigger
npm run validate:html && npm run validate:css
```

> **Script font:** `midnight-drive-subset.woff2` incluye solo los glifos de "Inspirado en la piel". Si cambia ese texto, hay que regenerarlo:
> `pyftsubset Midnight_Drive.otf --text="Nuevo texto" --flavor=woff2 --output-file=assets/fonts/midnight-drive-subset.woff2`

## Accesibilidad (objetivo WCAG 2.2 AA)

- **Estructura:** skip link, landmarks (`header`, `nav` con nombre, `main`, `footer`), un solo H1 y jerarquía H2/H3 sin saltos.
- **Menú mobile:** Collapse de Bootstrap. Escape cierra el menú y devuelve el foco, y el `aria-label` cambia entre "Abrir menú" y "Cerrar menú".
- **Selector de activos:** patrón ARIA *tabs*, con flechas, Home y End (incluido en Bootstrap 5.3).
- **FAQ:** acordeón con `aria-expanded` y `aria-controls`.
- **Foco y objetivos táctiles:** foco visible de 3 px en todos los elementos interactivos y objetivos de ≥ 44 px (supera el mínimo de 24 px del criterio 2.5.8).
- **Fijos:** `scroll-padding-top` para que el header fijo no tape el foco (2.4.11).
- **Animaciones:**
  - Solo animan `opacity` y `transform`, nunca `visibility`, así que el contenido sigue disponible para teclado y lectores de pantalla.
  - Un bloque que recibe el foco antes de aparecer se muestra al instante.
  - Se desactivan con `prefers-reduced-motion`.
  - Sin JavaScript, el contenido se ve completo.

## Resultados de QA (18/11/2026)

| Prueba | Herramienta | Resultado |
|---|---|---|
| HTML | Nu HTML Checker 26.11.17 | 0 errores, 0 advertencias |
| CSS (styles.css + bootstrap) | Nu CSS 26.11.17 | 0 errores |
| Accesibilidad automática | axe-core 4.14.1 (WCAG 2.0/2.1/2.2 A-AA + best practices), 375 y 1440 px, con menú, tabs y acordeón abiertos | 0 violaciones |
| Contraste sobre fondos con imagen o degradé | Medición píxel por píxel del fondo real (59–63 textos) | 0 fallos (el "10%" decorativo es un pseudo-elemento CSS) |
| Teclado | Recorrido completo con Tab, flechas en tabs, Space en FAQ, Escape en el menú y skip link | OK: 22 paradas en desktop, 18 en mobile, foco siempre visible |
| Responsive | 320 / 375 / 768 / 1024 / 1440 / 1920 px | Sin overflow horizontal ni errores de consola |
| Lighthouse 13.6 mobile (3 corridas) | Perf / A11y / BP / SEO | **99 / 100 / 100 / 100**. LCP 2,2 s · CLS 0 · TBT 20–60 ms |
| Lighthouse 13.6 desktop (3 corridas) | Perf / A11y / BP / SEO | **100 / 100 / 100 / 100**. LCP 0,5 s · CLS 0 · TBT 0 ms |

**Pendiente de verificación:**
- Prueba con lectores de pantalla reales (NVDA + Firefox, VoiceOver iOS/macOS).
- INP con datos de campo (CrUX o RUM) una vez publicada. En laboratorio, el TBT es de ≤ 60 ms.
- Prueba en Safari y Firefox reales. Las pruebas automáticas corrieron en Chromium.

## Antes de publicar

1. **URL pública:** publicada en GitHub Pages, en `https://rosariogebala-cyber.github.io/niacider-serum-landing/`. Si se mueve a otro dominio, actualizar esa URL en `index.html` (canonical, Open Graph, Twitter y JSON-LD), `robots.txt` y `sitemap.xml`.
2. **CTA de compra:** el botón final apunta a `https://www.cassara.com.ar/`. Confirmar la URL o reemplazarla por la tienda o el buscador de farmacias.
3. **Licencia de Midnight Drive:** la fuente declara *"Free for personal use only"*. Confirmar que Cassará tiene licencia comercial (si se usó en las piezas impresas, probablemente sí). Si no, reemplazarla por una manuscrita con licencia OFL.
4. **Revisión regulatoria:** validar los textos de beneficios con el área correspondiente. Están tomados textualmente de las piezas aprobadas.
5. **Servidor:** activar compresión (gzip o brotli) y caché larga para `/assets/` (por ejemplo `Cache-Control: public, max-age=31536000, immutable`, con versionado de archivos).
