const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');
  navigation?.classList.toggle('open', !isOpen);
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Abrir menú');
  });
});

const routeInfo = {
  villa: {
    title: 'Del puente al castillo',
    label: 'Paseo autoguiado',
    description: 'Comienza junto al Cuerpo de Hombre. Sube hacia la ermita, cruza la plaza y continúa hasta la iglesia y la fortaleza. El paseo es corto; recorre las calles a tu ritmo.',
    meta: [['Recorrido', 'Casco histórico'], ['Ritmo', 'A tu paso']],
    tab: 'tab-villa',
    google: 'https://www.google.com/maps/dir/?api=1&origin=Puente+de+Montemayor+del+R%C3%ADo&destination=Castillo+de+Montemayor+del+R%C3%ADo&waypoints=Ermita+de+San+Antonio+Montemayor+del+R%C3%ADo%7CPlaza+Mayor+Montemayor+del+R%C3%ADo&travelmode=walking',
    track: '',
  },
  miliarios: {
    title: 'Entre puentes y miliarios',
    label: 'Ruta circular señalizada',
    description: 'Desde la ermita, sigue el río por el Puente de Palo y el puente de La Malena. El regreso a Montemayor se realiza por el otro lado del valle. Hay un track GPX para seguir el trazado.',
    meta: [['Distancia', '12 km aprox.'], ['Duración', '3 h · dificultad baja']],
    tab: 'tab-miliarios',
    google: 'https://www.google.com/maps/dir/?api=1&origin=Ermita+de+San+Antonio,+Montemayor+del+R%C3%ADo&destination=Puente+de+la+Malena,+Salamanca&travelmode=walking',
    track: 'https://www.terranostrum.es/images/Tracks/GY/ruta-de-los-miliarios.gpx',
  },
  bosque: {
    title: 'Robles, setas y castaños',
    label: 'Sendero micológico circular',
    description: 'El camino señalizado enlaza Montemayor con El Cerro entre robles y castaños. Cuenta con paneles interpretativos; el track GPX permite consultar el recorrido completo antes de salir.',
    meta: [['Distancia', '7,8 km · track GPX'], ['Desnivel', '373 m · circular']],
    tab: 'tab-bosque',
    google: 'https://www.google.com/maps/dir/?api=1&origin=Puente+de+Montemayor+del+R%C3%ADo&destination=El+Cerro,+Salamanca&travelmode=walking',
    track: 'https://www.terranostrum.es/images/Tracks/XV/sendero-micologico-montemayor-del-rio-el-cerro.gpx',
  },
};

const routeTabs = [...document.querySelectorAll('.route-option')];
const routePanel = document.querySelector('#route-detail');
const routeTitle = routePanel?.querySelector('h3');
const routeLabel = routePanel?.querySelector('.eyebrow');
const routeDescription = routePanel?.querySelector('.route-description');
const routeMeta = routePanel?.querySelector('.route-meta');
const routeMapLink = routePanel?.querySelector('.map-link');
const trackLink = routePanel?.querySelector('.route-track-link');

function selectRoute(key, moveFocus = false) {
  const info = routeInfo[key];
  if (!info) return;
  routeTabs.forEach((tab) => {
    const active = tab.dataset.route === key;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    if (active && moveFocus) tab.focus();
  });
  routeTitle.textContent = info.title;
  routeLabel.textContent = info.label;
  routeDescription.textContent = info.description;
  routeMeta.replaceChildren(...info.meta.map(([label, value]) => {
    const span = document.createElement('span');
    const bold = document.createElement('b');
    bold.textContent = label;
    span.append(bold, document.createTextNode(value));
    return span;
  }));
  routePanel.setAttribute('aria-labelledby', info.tab);
  routeMapLink.href = info.google;
  if (info.track) {
    trackLink.href = info.track;
    trackLink.hidden = false;
  } else {
    trackLink.hidden = true;
  }
  document.querySelectorAll('.poster-route').forEach((line) => {
    line.classList.toggle('route-selected', line.dataset.posterRoute === key);
  });
}

routeTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectRoute(tab.dataset.route));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? routeTabs.length - 1
      : (index + (['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1) + routeTabs.length) % routeTabs.length;
    selectRoute(routeTabs[next].dataset.route, true);
  });
});

document.querySelectorAll('.legend-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const key = button.dataset.layer;
    const isVisible = button.getAttribute('aria-pressed') === 'true';
    button.setAttribute('aria-pressed', String(!isVisible));
    button.classList.toggle('muted', isVisible);
    document.querySelector(`[data-poster-route="${key}"]`)?.classList.toggle('route-hidden', isVisible);
  });
});

const mapPoster = document.querySelector('.map-poster');
const mapZoomLayer = document.querySelector('#map-zoom-layer');
const mapZoomLabel = document.querySelector('#map-zoom-level');
let mapZoom = 1;
function setMapZoom(value) {
  mapZoom = Math.min(3, Math.max(1, value));
  mapZoomLayer?.style.setProperty('--map-zoom', mapZoom.toFixed(2));
  if (mapZoomLabel) mapZoomLabel.value = `${Math.round(mapZoom * 100)}%`;
  document.querySelector('[data-zoom="in"]')?.toggleAttribute('disabled', mapZoom >= 3);
  document.querySelector('[data-zoom="out"]')?.toggleAttribute('disabled', mapZoom <= 1);
}
document.querySelectorAll('.map-zoom-controls [data-zoom]').forEach((button) => {
  button.addEventListener('click', () => {
    if (button.dataset.zoom === 'in') setMapZoom(mapZoom + 0.25);
    else if (button.dataset.zoom === 'out') setMapZoom(mapZoom - 0.25);
    else setMapZoom(1);
  });
});
mapPoster?.addEventListener('wheel', (event) => {
  event.preventDefault();
  setMapZoom(mapZoom + (event.deltaY < 0 ? 0.15 : -0.15));
}, { passive: false });
setMapZoom(1);

const shopCards = [...document.querySelectorAll('.shop-card')];
const filterButtons = [...document.querySelectorAll('.filter-chip')];
const searchInput = document.querySelector('#shop-search');
const noResults = document.querySelector('#no-results');
let activeFilter = 'todos';

function filterShops() {
  const query = (searchInput?.value || '').trim().toLocaleLowerCase('es');
  let shown = 0;
  shopCards.forEach((card) => {
    const categoryMatches = activeFilter === 'todos' || card.dataset.category === activeFilter;
    const queryMatches = !query || `${card.dataset.search} ${card.textContent}`.toLocaleLowerCase('es').includes(query);
    const visible = categoryMatches && queryMatches;
    card.classList.toggle('hidden-card', !visible);
    shown += visible ? 1 : 0;
  });
  noResults.hidden = shown !== 0;
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    filterShops();
  });
});
searchInput?.addEventListener('input', filterShops);

document.querySelectorAll('.map-link[data-place]').forEach((link) => {
  if (!link.closest('#route-detail')) {
    link.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(link.dataset.place)}`;
  }
  link.target = '_blank';
  link.rel = 'noreferrer';
});

selectRoute('villa');
