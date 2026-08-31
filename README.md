# Emprendimientos-Curaco

Mapa interactivo de los emprendimientos turísticos de la Ruta **"Explora
Curaco"**, Programa de Fortalecimiento de la Oferta Turística Local —
Municipalidad de Curaco de Vélez (Contrato de Consultoría ID 3285-4-L126).

Proyecto independiente (no depende de `interfaz_huella_local`).

## ⚠ Estado de los datos (a la fecha de creación de este proyecto)

El programa contempla **16 emprendimientos** en total. Al día de hoy solo se
han recibido fichas de levantamiento para **7** de ellos (códigos EC-10 a
EC-16):

| Estado | Cantidad | Detalle |
|---|---|---|
| Geolocalizados en el mapa | 5 | EC-10, EC-12, EC-13, EC-15, EC-16 |
| Con ficha pero sin coordenadas | 2 | EC-11 (operación itinerante), EC-14 (borrador incompleto, sin nombre ni ubicación) |
| Sin ficha recibida | 9 | EC-01 a EC-09 — no hay ningún dato disponible |

**No se inventó ninguna coordenada ni dato faltante.** A medida que se
reciban las fichas de EC-01 a EC-09 y se completen EC-11/EC-14, deben
agregarse siguiendo la misma estructura (ver abajo).

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
- **Filtro por rubro** (aventura / gastronomía / guiado).
- **Popup por emprendimiento** con: nombre, rubro, ubicación, fortalezas,
  brechas de equipamiento y normativas, necesidad de inversión y potencial de
  integración a la ruta — toda la información descriptiva ya registrada en
  cada ficha.
- **Navegación directa a Google Maps** ("Cómo llegar") desde cada punto,
  usando `https://www.google.com/maps/dir/?api=1&destination=lat,lng`.
- **Panel de pendientes**: lista aparte de los emprendimientos con ficha pero
  sin coordenadas, y de los códigos EC-01 a EC-09 aún no recibidos — para que
  quede explícito qué falta, en vez de omitirlo silenciosamente.

## 🚧 Qué NO incluye todavía (deliberadamente)

- **Análisis territorial integrado** (conectividad entre atractivos, tiempos
  reales de desplazamiento considerando caminos rurales y trasbordos,
  accesibilidad universal): en esta versión el mapa solo muestra la
  información de accesibilidad ya descrita en cada ficha (ej. "acceso
  completo en vehículo", "accesibilidad solo parcial"). No se calculan
  tiempos de ruta ni se integra un motor de rutas — eso requiere decidir con
  qué servicio (OSRM, Google Directions API, etc.) y si implica costo/API key.
- Los 9 emprendimientos sin ficha (EC-01 a EC-09).

## 🔧 Cómo agregar un emprendimiento nuevo

1. Si tiene coordenadas confirmadas: agregar un `Feature` nuevo en
   `data/emprendimientos.geojson`, siguiendo la misma estructura de
   `properties` que los existentes (`codigo_ficha`, `nombre_emprendedor`,
   `rut`, `nombre_emprendimiento`, `rubro_principal`, `categoria` —
   `aventura` | `gastronomia` | `guiado` | `bienestar` —, `ubicacion_sector`,
   `fortalezas`, `brechas_equipamiento`, `brechas_normativas`,
   `potencial_integracion`, `necesidad_inversion`, `sitio_web`,
   `estado_ficha`, `fuente_documento`). Recordar que GeoJSON usa
   `[longitud, latitud]` (no al revés).
2. Si aún no tiene coordenadas: agregarlo al array `sin_coordenadas` de
   `data/emprendimientos_pendientes.json`.
3. Sacar su código del array `codigos_faltantes` en el mismo archivo, si
   corresponde.

## 🛠️ Tecnologías

- Leaflet.js (mapa)
- GeoJSON (base de datos georreferenciada)
- HTML5/CSS3 + JavaScript vanilla, sin build step — abrir `index.html` en un
  navegador o servir la carpeta con cualquier servidor estático.
