import mapboxgl from 'mapboxgl';
import * as turf from '@turf/turf';
import 'chart.js';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

let created = false;

const initMap = () => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoieWFubmx1Y2tsZWluIiwiYSI6ImNqcnZmeHQwaDAxb2o0NGx2bG1tOWgwNGIifQ.q4zhKOCoH7nDIJNm88leXg';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/yannlucklein/cly83l5kh00jc01pr8yx7a3ye',
    zoom: 4,
    center: [137.85, 38.4],
    // pitch: 40,
  });

  map.on('style.load', () => {
    map.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512,
    });
    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1 });
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

const initChart = () => {
  const elevationCanvas = document.querySelector('#bicycle-trip-elevation');
  console.log(elevationCanvas.width);
  const gradient = elevationCanvas
    .getContext('2d')
    .createLinearGradient(0, 0, elevationCanvas.width * 3, 0);
  gradient.addColorStop(0, '#7b4397');
  gradient.addColorStop(1, '#dc2430');

  var data = {
    labels: [...Array(7).keys()],
    datasets: [
      {
        label: 'Altitude',
        backgroundColor: gradient,
        borderColor: 'black',
        borderWidth: 2,
        hoverBackgroundColor: 'rgba(255,99,132,0.4)',
        hoverBorderColor: 'black',
        data: [65, 59, 20, 81, 56, 55, 40],
        fill: true,
        pointStyle: false,
      },
    ],
  };
  const fontSize = window.innerWidth <= 1000 ? 16 : 32;

  const config = {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Distance (km)",
            align: 'end',
            font: {
              size: fontSize,
            },
          },
          ticks: {
            font: {
              size: fontSize,
            },
          },
        },
        y: {
          title: {
            display: true,
            text: "Altitude (m)",
            align: 'end',
            font: {
              size: fontSize,
            },
          },
          ticks: {
            font: {
              size: fontSize,
            },
          },
          suggestedMax: 100,
        },
      },
    },
  };
  return new Chart('bicycle-trip-elevation', config);
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

  const coords = data.features[0].geometry.coordinates;

  const markerContent = document.createElement('div');
  markerContent.innerHTML = `
        <span class="marker ${
          pending ? 'pending' : ''
        }"><i class="icon fa-solid fa-person-biking"></i></span>
      `;
  const [title, info] = data.name.split(' | ');
  const instaLinks = data?.instaLinks || [];
  const [days, distance] = info.split(', ');

  const popupElement = `
    <div class="popup" id="bicycle-trip-popup-${routeIndex}">
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

  const elevationCanvas = document.querySelector('#bicycle-trip-elevation');
  const elevations = [];
  const distances = [];
  coords.forEach((coord, index) => {
    const elevation = map.queryTerrainElevation(coord) || 0;
    elevations.push(elevation);
    if (distances.length === 0) {
      distances.push(0);
    } else {
      const line = turf.lineString([coords[index - 1], coord]);
      const length = turf.length(line);
      const cumulDistance = length + distances.at(-1);
      distances.push(cumulDistance);
    }
  });

  popup.on('open', () => {
    console.log(elevations);
    console.log(chart.data);
    chart.data.labels = distances.map((dist) =>
      dist.toFixed(distances.at(-1) > 100 ? 0 : 1),
    );
    console.log(chart.data.labels.length, elevations.length);
    chart.data.datasets[0].data = elevations;
    chart.update();
    elevationCanvas.classList.add('active');
  });

  popup.on('close', () => {
    elevationCanvas.classList.remove('active');
  });
};

const chart = initChart();
initMap();
