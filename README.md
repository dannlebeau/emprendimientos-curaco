# Emprendimientos-Curaco

Mapa interactivo de los emprendimientos turísticos de la Ruta **"Explora
Curaco"**, Programa de Fortalecimiento de la Oferta Turística Local —
Municipalidad de Curaco de Vélez (Contrato de Consultoría ID 3285-4-L126).

Proyecto independiente (no depende de `interfaz_huella_local`).

## ⚠ Estado de los datos

Las **16 fichas** del programa (EC-01 a EC-16) ya fueron recibidas y
revisadas contra el documento original de cada una:

| Estado | Cantidad | Detalle |
|---|---|---|
| Geolocalizados en el mapa | 14 | EC-01 a EC-10, EC-12, EC-13, EC-15, EC-16 |
| Con ficha completa pero sin coordenadas | 2 | EC-11 (operación itinerante, sin dirección fija), ficha de Patricia Vargas (borrador incompleto: sin código, nombre, RUT ni ubicación) |

**No se inventó ninguna coordenada ni dato faltante.** Todos los valores
(RUT, coordenadas, fortalezas, brechas) se extrajeron directamente del texto
de cada PDF y se verificaron con una segunda extracción independiente
(`pdftotext`) antes de publicarse.

La coordenada de EC-12 (Muelle Chonos) viene marcada en su ficha original
como *"[verificar con beneficiaria]"* — se incluyó igual porque es la única
disponible, con `coordenadas_verificadas: false` en el dato.

## 📁 Estructura

```
Emprendimientos-Curaco/
├── index.html                              # Mapa principal
├── data/
│   ├── emprendimientos.geojson             # Base georreferenciada (GeoJSON estándar,
│   │                                          EPSG:4326) — compatible con Google My Maps
│   │                                          y cualquier software SIG (QGIS, ArcGIS, etc.)
│   └── emprendimientos_pendientes.json     # Emprendimientos sin coordenadas + registro
│                                              explícito de lo que falta por levantar
├── assets/
│   ├── css/style.css
│   └── js/map.js
└── README.md
```

## ✨ Qué incluye esta primera versión

- **Base de datos georreferenciada** en GeoJSON estándar (`data/emprendimientos.geojson`):
  se puede importar directo en [Google My Maps](https://mymaps.google.com)
  (Importar → arrastrar el archivo) o en cualquier SIG (QGIS, ArcGIS, etc.).
- **Mapa interactivo responsivo** (Leaflet), funciona en escritorio y móvil,
  con selector de **5 mapas base gratuitos** (sin API key, arriba a la
  derecha): Esri Satelital (por defecto — útil para ver accesos rurales y
  relieve real), Esri Topográfico, OpenTopoMap, CartoDB Claro y OpenStreetMap.
- **Filtro por rubro** (aventura / gastronomía / guiado-naturaleza / hospedaje).
- **Popup por emprendimiento** con: nombre, rubro, ubicación, fortalezas,
  brechas de equipamiento y normativas, necesidad de inversión y potencial de
  integración a la ruta — toda la información descriptiva ya registrada en
  cada ficha.
- **Navegación directa a Google Maps** ("Cómo llegar") desde cada punto,
  usando `https://www.google.com/maps/dir/?api=1&destination=lat,lng`.
- **Panel de pendientes**: lista aparte de los 2 emprendimientos con ficha
  pero sin coordenadas (EC-11 y la ficha de Patricia Vargas), para que quede
  explícito qué falta en vez de omitirlo silenciosamente.

## 🚧 Qué NO incluye todavía (deliberadamente)

- **Análisis territorial integrado** (conectividad entre atractivos, tiempos
  reales de desplazamiento considerando caminos rurales y trasbordos,
  accesibilidad universal): en esta versión el mapa solo muestra la
  información de accesibilidad ya descrita en cada ficha (ej. "acceso
  completo en vehículo", "accesibilidad solo parcial"). No se calculan
  tiempos de ruta ni se integra un motor de rutas — eso requiere decidir con
  qué servicio (OSRM, Google Directions API, etc.) y si implica costo/API key.
- La ficha de Patricia Vargas, que sigue en borrador (sin nombre completo,
  RUT, ubicación ni coordenadas) — falta que el municipio o la consultora la
  completen.

## 🔧 Cómo agregar un emprendimiento nuevo

1. Si tiene coordenadas confirmadas: agregar un `Feature` nuevo en
   `data/emprendimientos.geojson`, siguiendo la misma estructura de
   `properties` que los existentes (`codigo_ficha`, `nombre_emprendedor`,
   `rut`, `nombre_emprendimiento`, `rubro_principal`, `categoria` —
   `aventura` | `gastronomia` | `guiado` | `hospedaje` | `bienestar` —,
   `ubicacion_sector`, `fortalezas`, `brechas_equipamiento`,
   `brechas_normativas`, `potencial_integracion`, `necesidad_inversion`,
   `sitio_web`, `estado_ficha`, `fuente_documento`). Recordar que GeoJSON usa
   `[longitud, latitud]` (no al revés).
2. Si aún no tiene coordenadas (como la ficha de Patricia Vargas): agregarlo
   al array `sin_coordenadas` de `data/emprendimientos_pendientes.json`.

## 🛠️ Tecnologías

- Leaflet.js (mapa)
- GeoJSON (base de datos georreferenciada)
- HTML5/CSS3 + JavaScript vanilla, sin build step — abrir `index.html` en un
  navegador o servir la carpeta con cualquier servidor estático.
