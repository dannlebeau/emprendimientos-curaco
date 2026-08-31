/*
 * Emprendimientos-Curaco — Mapa de la Ruta "Explora Curaco"
 * Programa de Fortalecimiento de la Oferta Turística Local
 * Municipalidad de Curaco de Vélez — Contrato de Consultoría ID 3285-4-L126
 *
 * Elaborado por Dann LeBeau × Geopolis (geopolis.cl)
 */

//=============== FIRMA Y CLICK DERECHO ===============//
// Bloquea el menú contextual (click derecho). No impide ver el código con
// F12/Ctrl+U -- ningún sitio puede evitar eso -- pero saca el atajo directo.
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Propiedad oculta (no enumerable: no aparece en console.log(window),
// Object.keys ni JSON.stringify) como huella de autoría en el código fuente.
Object.defineProperty(window, '__fingerprint__', {
    value: 'Emprendimientos-Curaco · Ruta Explora Curaco · Elaborado por Dann LeBeau × Geopolis (geopolis.cl)',
    enumerable: false,
    writable: false,
    configurable: false
});

console.log(
    '%cGeopolis %c· Emprendimientos Curaco — Ruta Explora Curaco\nElaborado por Dann LeBeau × Geopolis\nhttps://dannlebeau.github.io/ownroute.github.io/ · https://www.geopolis.cl',
    'color:#00838f; font-weight:bold; font-size:14px;',
    'color:#263238; font-size:12px;'
);

const CATEGORY_COLORS = {
    aventura: '#2e7d32',
    gastronomia: '#d84315',
    guiado: '#1565c0',
    hospedaje: '#00838f',
    bienestar: '#6a1b9a'
};

const CATEGORY_LABELS = {
    aventura: 'Turismo aventura',
    gastronomia: 'Gastronomía',
    guiado: 'Guiado / Naturaleza',
    hospedaje: 'Hospedaje',
    bienestar: 'Bienestar / Terapéutico'
};

const CURACO_CENTER = [-42.4180, -73.5650];

// Orden geográfico sugerido del recorrido (no por categoría): sigue la
// secuencia real de sectores de la ruta — San Javier → Changüitad → Huyar
// Alto → centro → bifurcación hacia Achao → Palqui — en vez de agrupar por
// rubro, que no refleja cómo se recorre físicamente la isla.
const ROUTE_ORDER = [
    'EC-01-CV', 'EC-02-CV', 'EC-15-CV',
    'EC-04-CV', 'EC-03-CV', 'EC-05-CV', 'EC-06-CV', 'EC-07-CV',
    'EC-08-CV', 'EC-16-CV',
    'EC-10-CV', 'EC-09-CV', 'EC-12-CV', 'EC-13-CV'
];

let map;
let markersLayer;
let routeLayer;
let markersByCode = {};
let activeCategories = new Set(Object.keys(CATEGORY_COLORS));
let allFeatures = [];

function initMap() {
    map = L.map('map', { zoomControl: false }).setView(CURACO_CENTER, 12);

    // Capas base gratuitas (sin API key). maxNativeZoom evita el cartel
    // "Map data not yet available" de Esri más allá de su zoom nativo:
    // Leaflet reescala el último tile en vez de pedir uno inexistente.
    const openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
    });

    const esriWorldImagery = L.tileLayer('https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri',
        maxZoom: 19,
        maxNativeZoom: 17
    });

    const esriWorldTopo = L.tileLayer('https://server.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri',
        maxZoom: 19,
        maxNativeZoom: 18
    });

    const openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenTopoMap (CC-BY-SA), © OpenStreetMap',
        maxZoom: 19,
        maxNativeZoom: 17
    });

    // Esri Satelital por defecto: útil para reconocer accesos rurales y
    // relieve real de la ruta, más allá de lo que muestra un mapa de calles.
    esriWorldImagery.addTo(map);

    const baseMaps = {
        'Esri Satelital': esriWorldImagery,
        'Esri Topográfico': esriWorldTopo,
        'OpenTopoMap': openTopoMap,
        'OpenStreetMap': openStreetMap
    };

    L.control.layers(baseMaps, null, { position: 'topright', collapsed: true }).addTo(map);
    // bottomright (no bottomleft): el sidebar ocupa toda la columna
    // izquierda cuando está abierto -por defecto lo está- y taparía el
    // control de zoom ahí. En bottomright queda apilado sobre la leyenda,
    // zona que el sidebar nunca cubre.
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    addLegend();

    markersLayer = L.layerGroup().addTo(map);
}

function addLegend() {
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'map-legend');
        const rows = Object.keys(CATEGORY_LABELS).filter(cat => cat !== 'bienestar').map(cat =>
            `<div class="legend-row"><span class="legend-dot" style="background:${CATEGORY_COLORS[cat]}"></span>${CATEGORY_LABELS[cat]}</div>`
        ).join('');
        div.innerHTML = `<div class="legend-title">Leyenda</div>${rows}<div class="legend-credit">Elaborado por <a href="https://dannlebeau.github.io/ownroute.github.io/" target="_blank" rel="noopener">Dann LeBeau</a> by <a href="https://www.geopolis.cl" target="_blank" rel="noopener">Geopolis</a></div>`;
        L.DomEvent.disableClickPropagation(div);
        return div;
    };
    legend.addTo(map);
}

function buildRouteLayer() {
    const coordsByCode = {};
    allFeatures.forEach(f => { coordsByCode[f.properties.codigo_ficha] = f.geometry.coordinates; });

    const latlngs = ROUTE_ORDER
        .map(code => coordsByCode[code])
        .filter(Boolean)
        .map(([lng, lat]) => [lat, lng]);

    routeLayer = L.polyline(latlngs, {
        color: '#37474f',
        weight: 3,
        opacity: 0.75,
        dashArray: '2 10',
        lineCap: 'round'
    });
}

function setupRouteToggle() {
    document.getElementById('routeToggle').addEventListener('change', (e) => {
        if (e.target.checked) {
            routeLayer.addTo(map);
            if (window.innerWidth <= 640) {
                document.getElementById('sidebar').classList.add('hidden');
            }
        } else {
            map.removeLayer(routeLayer);
        }
    });
}

function makeIcon(categoria) {
    const color = CATEGORY_COLORS[categoria] || '#455a64';
    return L.divIcon({
        className: 'ec-marker',
        html: `<div style="
            width: 26px; height: 26px; border-radius: 50% 50% 50% 0;
            background: ${color}; border: 2px solid #fff;
            box-shadow: 0 1px 4px rgba(0,0,0,0.4);
            transform: rotate(-45deg);
        "></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
        popupAnchor: [0, -26]
    });
}

function listToHtml(items) {
    if (!items || items.length === 0) return '';
    return '<ul>' + items.map(i => `<li>${i}</li>`).join('') + '</ul>';
}

function popupHtml(props, lat, lng) {
    const gmapsDir = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    const gmapsView = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    let html = `<div class="ec-popup">
        <h3>${props.nombre_emprendimiento || props.nombre_emprendedor}</h3>
        <p class="popup-rubro">${props.rubro_principal}</p>
        <p style="margin:0 0 6px;">${props.ubicacion_sector}</p>`;

    if (props.nota_coordenadas) {
        html += `<p style="margin:0 0 6px; font-size:11px; color:#e65100;">⚠ ${props.nota_coordenadas}</p>`;
    }

    if (props.fortalezas && props.fortalezas.length) {
        html += `<div class="popup-section-label">Fortalezas</div>${listToHtml(props.fortalezas)}`;
    }
    if (props.brechas_equipamiento && props.brechas_equipamiento.length) {
        html += `<div class="popup-section-label">Brechas de equipamiento</div>${listToHtml(props.brechas_equipamiento)}`;
    }
    if (props.brechas_normativas && props.brechas_normativas.length) {
        html += `<div class="popup-section-label">Brechas normativas</div>${listToHtml(props.brechas_normativas)}`;
    }
    if (props.necesidad_inversion) {
        html += `<div class="popup-section-label">Necesidad de inversión</div><p style="margin:2px 0;">${props.necesidad_inversion}</p>`;
    }
    if (props.potencial_integracion) {
        html += `<div class="popup-section-label">Integración a la ruta</div><p style="margin:2px 0;">${props.potencial_integracion}</p>`;
    }

    html += `<div class="popup-actions">
        <a href="${gmapsDir}" target="_blank" rel="noopener">📍 Cómo llegar</a>
        <a href="${gmapsView}" target="_blank" rel="noopener" class="secondary">Ver en Google Maps</a>`;
    if (props.sitio_web) {
        html += `<a href="${props.sitio_web}" target="_blank" rel="noopener" class="secondary">🌐 Sitio web</a>`;
    }
    html += `</div></div>`;

    return html;
}

function renderMarkers() {
    markersLayer.clearLayers();
    markersByCode = {};

    allFeatures.forEach(feature => {
        const props = feature.properties;
        if (!activeCategories.has(props.categoria)) return;

        const [lng, lat] = feature.geometry.coordinates;
        const marker = L.marker([lat, lng], { icon: makeIcon(props.categoria) });
        marker.bindPopup(popupHtml(props, lat, lng));
        marker.addTo(markersLayer);
        markersByCode[props.codigo_ficha] = marker;
    });
}

function renderSidebarList() {
    const listEl = document.getElementById('emprendimientoList');
    listEl.innerHTML = '';

    allFeatures.forEach(feature => {
        const props = feature.properties;
        if (!activeCategories.has(props.categoria)) return;

        const card = document.createElement('div');
        card.className = 'emprendimiento-card';
        card.style.borderLeftColor = CATEGORY_COLORS[props.categoria] || '#455a64';
        card.innerHTML = `
            <p class="card-title">${props.nombre_emprendimiento || props.nombre_emprendedor}</p>
            <p class="card-meta">${CATEGORY_LABELS[props.categoria]} · ${props.ubicacion_sector}</p>
        `;
        card.addEventListener('click', () => {
            const marker = markersByCode[props.codigo_ficha];
            if (!marker) return;
            map.flyTo(marker.getLatLng(), 15, { duration: 0.6 });
            marker.openPopup();
            if (window.innerWidth <= 640) {
                document.getElementById('sidebar').classList.add('hidden');
            }
        });
        listEl.appendChild(card);
    });
}

function renderPendientes(data) {
    const container = document.getElementById('pendientesList');
    container.innerHTML = '';

    (data.sin_coordenadas || []).forEach(item => {
        const card = document.createElement('div');
        card.className = 'emprendimiento-card pendiente-card';
        const nombre = item.nombre_emprendimiento || item.nombre_emprendedor || 'Emprendimiento sin datos';
        card.innerHTML = `
            <p class="card-title">${nombre}</p>
            <p class="card-meta">${item.rubro_principal || 'Rubro por confirmar'}</p>
            <span class="badge">${item.estado_ficha}</span>
        `;
        container.appendChild(card);
    });
}

function setupCategoryFilters() {
    document.querySelectorAll('.category-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const cat = chip.dataset.cat;
            if (activeCategories.has(cat)) {
                activeCategories.delete(cat);
                chip.classList.remove('active');
            } else {
                activeCategories.add(cat);
                chip.classList.add('active');
            }
            renderMarkers();
            renderSidebarList();
        });
    });
}

function setupSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleSidebar');

    // El sidebar entra abierto por defecto, así que el ícono parte como
    // flecha "colapsar" (◀) y cambia a "expandir" (▶) una vez cerrado.
    const syncToggleIcon = () => {
        toggleBtn.textContent = sidebar.classList.contains('hidden') ? '▶' : '◀';
        toggleBtn.title = sidebar.classList.contains('hidden') ? 'Mostrar filtros' : 'Ocultar filtros';
    };

    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
        syncToggleIcon();
    });
    document.getElementById('closeSidebar').addEventListener('click', () => {
        sidebar.classList.add('hidden');
        syncToggleIcon();
    });

    syncToggleIcon();
}

async function loadData() {
    const [geoRes, pendRes] = await Promise.all([
        fetch('./data/emprendimientos.geojson'),
        fetch('./data/emprendimientos_pendientes.json')
    ]);
    const geo = await geoRes.json();
    const pend = await pendRes.json();

    allFeatures = geo.features;

    document.getElementById('countGeolocalizados').textContent = allFeatures.length;
    document.getElementById('countPendientes').textContent = (pend.sin_coordenadas || []).length;

    renderMarkers();
    renderSidebarList();
    renderPendientes(pend);
    buildRouteLayer();
}

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    setupCategoryFilters();
    setupSidebarToggle();
    setupRouteToggle();
    loadData();
});
