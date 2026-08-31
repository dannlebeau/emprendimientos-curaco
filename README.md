# Emprendimientos-Curaco

**Mapa interactivo de la Ruta "Explora Curaco"** — visualización georreferenciada
de los emprendimientos turísticos relevados en el marco del **Programa de
Fortalecimiento de la Oferta Turística Local**, Municipalidad de Curaco de
Vélez, Chiloé (Contrato de Consultoría ID 3285-4-L126).

Sitio estático, sin backend ni build step: es HTML/CSS/JS puro sobre
[Leaflet](https://leafletjs.com/), con los datos en GeoJSON/JSON planos.
Proyecto independiente — no depende de ningún otro repositorio.

---

## Qué es esto

La consultora levantó una ficha técnica por cada emprendimiento de la ruta:
quién es el beneficiario, dónde está, cuáles son sus fortalezas, qué brechas
de equipamiento o normativas tiene, y qué inversión se propone para cerrarlas.
Este proyecto toma esas 16 fichas y las convierte en:

1. Una **base de datos georreferenciada** en formato estándar (GeoJSON),
   reutilizable en Google My Maps, QGIS, ArcGIS o cualquier otro SIG.
2. Un **mapa interactivo** para explorarlas visualmente, con toda la
   información de cada ficha disponible en un clic.

## Estado de los datos

Las **16 fichas** del programa (EC-01 a EC-16) fueron recibidas y revisadas
una por una contra el documento original — cada dato (RUT, coordenadas,
fortalezas, brechas) se extrajo del texto del PDF y, en los casos donde la
primera lectura no fue confiable, se verificó con una segunda extracción de
texto independiente (`pdftotext`) antes de publicarse. **No hay ninguna
coordenada ni dato inventado.**

| Estado | Cantidad | Códigos |
|---|---|---|
| ✅ Geolocalizados en el mapa | **14** | EC-01 a EC-10, EC-12, EC-13, EC-15, EC-16 |
| ⚠️ Con ficha completa pero sin coordenadas | **2** | EC-11 (Kumelawen Spa — operación itinerante, sin dirección fija), ficha de Patricia Vargas (borrador incompleto: sin código, nombre, RUT ni ubicación) |

Estos 2 casos no se ocultan: aparecen en un panel aparte del sidebar
("Pendientes de geolocalizar") con el motivo exacto de por qué no están en
el mapa. La coordenada de EC-12 (Muelle Chonos) viene marcada en su ficha
original como *"[verificar con beneficiaria]"* — se incluyó de todas formas
por ser la única disponible, marcada con `coordenadas_verificadas: false`.

## Funcionalidades

- **Mapa base gratuito, sin API key**: selector con 4 capas (arriba a la
  derecha) — Esri Satelital (por defecto, útil para reconocer accesos
  rurales y relieve real), Esri Topográfico, OpenTopoMap y OpenStreetMap.
- **Zoom** justo debajo del selector de mapas (arriba a la derecha) ·
  **Leyenda de categorías** abajo a la derecha, con el crédito de autoría.
- **Filtro por rubro** en el sidebar: Aventura, Gastronomía, Guiado /
  Naturaleza, Hospedaje — togglea qué categorías se muestran en el mapa y en
  la lista.
- **Ficha completa por emprendimiento** (clic en el mapa o en la lista del
  sidebar): nombre, rubro, ubicación, fortalezas, brechas de equipamiento y
  normativas, necesidad de inversión propuesta, y potencial de integración
  con otros puntos de la ruta.
- **"Cómo llegar"**: cada punto enlaza directo a direcciones de Google Maps
  (`google.com/maps/dir/?api=1&destination=lat,lng`) — no requiere abrir la
  app de Maps por separado ni buscar la dirección a mano.
- **Ruta sugerida** (toggle opcional en el sidebar): dibuja una línea que
  conecta los 14 puntos en el **orden geográfico real del recorrido**
  (San Javier → Changüitad → Huyar Alto → centro → bifurcación hacia Achao →
  Palqui), no por categoría — conectarlos por rubro no representa cómo se
  recorre físicamente la isla. Es una secuencia sugerida en línea recta entre
  puntos, no una ruta calculada sobre caminos reales (ver "Qué falta" abajo).
- **Sidebar fijo**: siempre visible, sin botón para ocultarlo.

## Estructura del proyecto

```
Emprendimientos-Curaco/
├── index.html                              Página única de la aplicación
├── assets/
│   ├── css/style.css                       Estilos (tema, sidebar, popups, leyenda)
│   └── js/map.js                           Lógica del mapa (Leaflet, filtros, popups)
├── data/
│   ├── emprendimientos.geojson             Base georreferenciada — los 14 puntos del mapa
│   └── emprendimientos_pendientes.json     Los 2 emprendimientos sin coordenadas
└── README.md                               Este archivo
```

No hay `node_modules` ni pasos de compilación: Leaflet se carga desde CDN
(`unpkg.com`) y el resto es JavaScript vanilla.

## Cómo verlo

Como usa `fetch()` para cargar los archivos `.geojson`/`.json`, **no se
puede abrir `index.html` directamente con doble clic** (el navegador
bloquea `fetch` sobre `file://`). Hay que servirlo con cualquier servidor
estático local, por ejemplo:

```bash
# Opción 1: Python (viene instalado en casi cualquier equipo)
cd Emprendimientos-Curaco
python -m http.server 8000
# abrir http://localhost:8000

# Opción 2: Node
npx serve .
```

O bien publicarlo tal cual en GitHub Pages, Netlify, Vercel o cualquier
hosting estático — no necesita configuración adicional.

## El modelo de datos

### `data/emprendimientos.geojson`

`FeatureCollection` estándar (EPSG:4326, `[longitud, latitud]`). Cada
`Feature` es un emprendimiento con estas `properties`:

| Campo | Tipo | Descripción |
|---|---|---|
| `codigo_ficha` | string | Código de levantamiento, ej. `"EC-04-CV"` |
| `nombre_emprendedor` | string | Nombre completo del beneficiario |
| `rut` | string \| null | RUT del beneficiario |
| `nombre_emprendimiento` | string | Nombre comercial del negocio |
| `rubro_principal` | string | Descripción del rubro |
| `categoria` | string | Una de: `aventura`, `gastronomia`, `guiado`, `hospedaje`, `bienestar` — controla el color del marcador y el filtro |
| `ubicacion_sector` | string | Dirección o sector, en texto libre |
| `coordenadas_verificadas` | boolean | `false` si la ficha original marcaba la coordenada como pendiente de confirmar |
| `nota_coordenadas` | string (opcional) | Aclaración cuando `coordenadas_verificadas` es `false` |
| `fortalezas` | string[] | Viñetas de fortalezas clave del negocio |
| `brechas_equipamiento` | string[] | Brechas de equipamiento o infraestructura |
| `brechas_normativas` | string[] | Brechas normativas o sanitarias (patente, SERNATUR, formalización) |
| `potencial_integracion` | string | Cómo se articula con el resto de la ruta |
| `necesidad_inversion` | string | Resumen del plan de inversión propuesto |
| `sitio_web` | string \| null | Link externo del negocio, si tiene |
| `estado_ficha` | string | `"completa"` u otro estado |
| `fuente_documento` | string | Nombre del PDF de origen, para trazabilidad |

### `data/emprendimientos_pendientes.json`

```jsonc
{
  "sin_coordenadas": [
    {
      "codigo_ficha": "EC-11-CV",
      "nombre_emprendedor": "...",
      "motivo_sin_coordenadas": "...",   // por qué no está en el mapa
      "estado_ficha": "...",
      "fuente_documento": "..."
    }
  ]
}
```

## Cómo agregar o corregir un emprendimiento

1. **Tiene coordenadas confirmadas** → agregar un `Feature` nuevo en
   `emprendimientos.geojson` siguiendo la tabla de campos de arriba.
   Recordar el orden `[longitud, latitud]` (al revés de como suelen venir
   en las fichas, que dicen "Latitud / Longitud").
2. **Todavía no tiene coordenadas** → agregarlo al array `sin_coordenadas`
   de `emprendimientos_pendientes.json`, con el `motivo_sin_coordenadas`
   explicado.
3. **Cambia el color de una categoría nueva** → agregarla a `CATEGORY_COLORS`
   y `CATEGORY_LABELS` en `assets/js/map.js`, y su chip de filtro en
   `index.html` (`.category-filters`).
4. **Entra a la ruta sugerida** → agregar su `codigo_ficha` en el lugar que
   corresponda dentro del array `ROUTE_ORDER` en `assets/js/map.js` (sigue
   el orden geográfico del recorrido, no el orden de las fichas).

No hace falta tocar nada más: el mapa, el sidebar, la leyenda y los
contadores se generan dinámicamente a partir de estos dos archivos.

## Qué falta (a propósito, no por omisión)

- **Análisis territorial integrado**: tiempos reales de desplazamiento
  (caminos rurales, trasbordos) y accesibilidad universal calculada. La
  "ruta sugerida" conecta los puntos en línea recta según su orden
  geográfico, no sobre la red de caminos real, y no calcula tiempos ni
  distancias de viaje. El mapa sí muestra la información de accesibilidad ya
  descrita en cada ficha (ej. "acceso completo en vehículo", "accesibilidad
  solo parcial"), pero un motor de rutas real requiere decidir con qué
  servicio (OSRM propio, Google Directions API, etc.) y si implica costo o
  llave de API.
- **La ficha de Patricia Vargas**, que sigue en borrador. Falta que el
  municipio o la consultora la completen con nombre, RUT, ubicación y
  coordenadas para poder agregarla al mapa.

## Créditos

Elaborado por **[Dann LeBeau](https://dannlebeau.github.io/ownroute.github.io/)**
por **[Geopolis](https://www.geopolis.cl)**, para el Programa de
Fortalecimiento de la Oferta Turística Local de la Municipalidad de Curaco
de Vélez.
