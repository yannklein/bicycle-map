import mapboxgl from 'mapboxgl';

// import getInstaHighlights from './getInstaHighlights.js';
// import Queue from './queue.js';

// const queue = new Queue();

// const randomColorGen = () =>
//   '#' + Math.floor(Math.random() * 0xffffff).toString(16);

const initMap = () => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoieWFubmx1Y2tsZWluIiwiYSI6ImNqcnZmeHQwaDAxb2o0NGx2bG1tOWgwNGIifQ.q4zhKOCoH7nDIJNm88leXg';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/yannlucklein/cly83l5kh00jc01pr8yx7a3ye',
    zoom: 4.9,
    center: [137.85,38.4],
  });

  map.on('load', async () => {
    let routeIndex = 0;
    while (true) {
      try {
        const response = await fetch(
          `./bicycle-trips/bicycle-trip-${routeIndex}.geojson`,
        );
        if (response.status === 404) {
          throw new Error(
            `End of routes: route ${routeIndex} not found, loaded ${
              routeIndex - 1
            }`,
          );
        }
        const data = await response.json();
        addBicycleRoute(map, data, routeIndex);
        routeIndex += 1;
      } catch (error) {
        if (error.message.includes('End of routes')) {
          console.warn(error.message);
        } else {
          console.error(error);
        }
        break;
      }
    }
  });
};

const addBicycleRoute = (map, data, routeIndex) => {

  const pending = data.status === 'pending';

  map.addSource(`bicycle-trip-${routeIndex}`, {
    type: 'geojson',
    data: `./bicycle-trips/bicycle-trip-${routeIndex}.geojson`,
    lineMetrics: true,
  });

  const layerPaint = {
    'line-width': 8,
    'line-gradient': [
      'interpolate',
      ['linear'],
      ['line-progress'],
      0,
      '#7b4397',
      1,
      '#dc2430',
    ],
  };

  const layerLayout = {
    'line-cap': 'round',
    'line-join': 'round',
  };

  if (pending) {
    layerPaint['line-width'] = 4;
    layerPaint['line-dasharray'] = [0.5, 1.5];
    layerPaint['line-gradient'] = [
      'interpolate',
      ['linear'],
      ['line-progress'],
      0,
      '#777777',
      1,
      '#777777',
    ];
  }

  map.addLayer({
    id: `bicycle-trip-layer-${routeIndex}`,
    type: 'line',
    layout: layerLayout,
    source: `bicycle-trip-${routeIndex}`,
    paint: layerPaint,
  });

  const coords = data.features
    .map((feature) => feature.geometry.coordinates)
    .flat();

  const markerContent = document.createElement('div');
  markerContent.innerHTML = `
        <span class="marker ${pending ? 'pending' : ''}"><i class="icon fa-solid fa-person-biking"></i></span>
      `;
  const [title, info] = data.name.split(' | ');
  const instaLinks = data?.instaLinks || [];
  const [days, distance] = info.split(', ');

  const popupElement = `
        <div class="popup">
          <i class="icon ${pending ? 'pending' : ''} fa-solid fa-person-biking"></i>
          <div>
            <h4>${title}</h4>
            <div class="info">
              <span><i class="fa-regular fa-clock"></i> ${days}</span>
              <span><i class="fa-solid fa-route"></i> ${distance}</span>
            </div>
          </div>
          <div>
            ${pending ? 'Not cycled yet' : ''}
            ${instaLinks.reduce(
              (acc, link) =>
                `${acc}<a target="_blank" class="insta-link" href=${link}><i class="fa-brands fa-square-instagram"></i></a>`,
              '',
            )}
          </div>
        </div>
      `;
  const popup = new mapboxgl.Popup({
    closeButton: false,
  }).setHTML(popupElement);

  const marker = new mapboxgl.Marker(markerContent)
    .setLngLat(coords[Math.floor(coords.length / 2)])
    .setPopup(popup)
    .addTo(map);

  // queue.addToQueue(async () => {
  //   const response = await getInstaHighlights('17942328881693253');
  //   const instaData = await response.json();
  //   console.log(instaData);
  // })
};

initMap();
