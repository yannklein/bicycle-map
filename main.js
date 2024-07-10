import mapboxgl from 'mapboxgl';

import getInstaHighlights from './getInstaHighlights.js';
import Queue from './queue.js';

const queue = new Queue();

const randomColorGen = () =>
  '#' + Math.floor(Math.random() * 0xffffff).toString(16);

mapboxgl.accessToken =
  'pk.eyJ1IjoieWFubmx1Y2tsZWluIiwiYSI6ImNqcnZmeHQwaDAxb2o0NGx2bG1tOWgwNGIifQ.q4zhKOCoH7nDIJNm88leXg';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/yannlucklein/cly83l5kh00jc01pr8yx7a3ye',
  zoom: 5.5,
  center: [135.50218, 34.69374],
});

map.on('load', async () => {
  for (let i = 0; i < 10; i += 1) {
    const geojsonPath = `./bicycle-trips/bicycle-trip-${i}.geojson`;
    map.addSource(`bicycle-trip-${i}`, {
      type: 'geojson',
      data: geojsonPath,
      lineMetrics: true,
    });

    map.addLayer({
      id: `bicycle-trip-layer-${i}`,
      type: 'line',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      source: `bicycle-trip-${i}`,
      paint: {
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
      },
    });

    const response = await fetch(geojsonPath);
    const data = await response.json();
    const coords = data.features
      .map((feature) => feature.geometry.coordinates)
      .flat();
    const markerContent = document.createElement('div');
    markerContent.innerHTML = `
          <span class="marker"><i class="icon fa-solid fa-person-biking"></i></span>
        `;
    // console.log(data);
    const [title, info] = data.name.split(' | ');
    const instaLinks = data?.instaLinks || [];
    const [days, distance] = info.split(', ');
    const popupElement = `
          <div class="popup">
            <i class="icon fa-solid fa-person-biking"></i>
            <div>
              <h4>${title}</h4>
              <div class="info" >
                <span><i class="fa-regular fa-clock"></i> ${days}</span>
                <span><i class="fa-solid fa-route"></i> ${distance}</span>
              </div>
            </div>
            <div>
              ${instaLinks.reduce((acc, link) => `${acc}<a class="insta-link" href=${link}><i class="fa-brands fa-square-instagram"></i></a>`, "")}
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
  }
});
