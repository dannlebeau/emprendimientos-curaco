/*
 * Emprendimientos-Curaco — Mapa de la Ruta "Explora Curaco"
 * Programa de Fortalecimiento de la Oferta Turística Local
 * Municipalidad de Curaco de Vélez — Contrato de Consultoría ID 3285-4-L126
 */

const CATEGORY_COLORS = {
    aventura: '#2e7d32',
    gastronomia: '#d84315',
    guiado: '#1565c0',
    bienestar: '#6a1b9a'
};

const CATEGORY_LABELS = {
    aventura: 'Turismo aventura',
    gastronomia: 'Gastronomía',
    guiado: 'Guiado / Miradores',
    bienestar: 'Bienestar / Terapéutico'
};

const CURACO_CENTER = [-42.4180, -73.5650];

let map;
let markersLayer;
let markersByCode = {};
let activeCategories = new Set(Object.keys(CATEGORY_COLORS));
let allFeatures = [];

function initMap() {
    map = L.map('map', { zoomControl: false }).setView(CURACO_CENTER, 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
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

    const missing = data.sin_ficha_recibida;
    if (missing) {
        const note = document.getElementById('missingNote');
        note.innerHTML = `<strong>Fichas aún no recibidas (${missing.codigos_faltantes.length}):</strong> ${missing.codigos_faltantes.join(', ')}. ${missing.descripcion}`;
    }
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
    document.getElementById('toggleSidebar').addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
    });
    document.getElementById('closeSidebar').addEventListener('click', () => {
        sidebar.classList.add('hidden');
    });
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
    document.getElementById('countPendientes').textContent =
        (pend.sin_coordenadas || []).length + (pend.sin_ficha_recibida ? pend.sin_ficha_recibida.codigos_faltantes.length : 0);

    renderMarkers();
    renderSidebarList();
    renderPendientes(pend);
}

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    setupCategoryFilters();
    setupSidebarToggle();
    loadData();
});
