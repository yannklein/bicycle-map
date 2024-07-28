import mapboxgl from 'mapboxgl';
import * as turf from '@turf/turf';
import ElevationChart from './ElevationChart.js';

export default class BicycleMap {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.gradientColors = ['#7b4397', '#dc2430'];
    this.mapStyle = ''mapbox://styles/yannlucklein/cly83l5kh00jc01pr8yx7a3ye'';
    this.chart = new ElevationChart(this.gradientColors);
    this.initMap();
    this.addLayers();
  }

  initMap() {
    mapboxgl.accessToken = this.accessToken;

    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.mapStyle,
      zoom: 4,
      center: [137.85, 38.4],
      // pitch: 40,
    });

    this.map.on('style.load', () => {
      this.map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
      });
      this.map.setTerrain({ source: 'mapbox-dem', exaggeration: 1 });
    });
  }

  addLayers() {
    this.map.on('load', async () => {
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
          this.addBicycleRoute(data, routeIndex);
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
  }

  addBicycleRoute(data, routeIndex) {
    const pending = data.status === 'pending';

    this.map.addSource(`bicycle-trip-${routeIndex}`, {
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
        this.gradientColors[0],
        1,
        this.gradientColors[1],
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

    this.map.addLayer({
      id: `bicycle-trip-layer-${routeIndex}`,
      type: 'line',
      layout: layerLayout,
      source: `bicycle-trip-${routeIndex}`,
      paint: layerPaint,
    });

    this.addMarker(data, pending, routeIndex);
  }

  addMarker(data, pending, routeIndex) {
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
        <i class="icon ${
          pending ? 'pending' : ''
        } fa-solid fa-person-biking"></i>
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

    const coords = data.features[0].geometry.coordinates;

    new mapboxgl.Marker(markerContent)
      .setLngLat(coords[Math.floor(coords.length / 2)])
      .setPopup(popup)
      .addTo(this.map);

    this.displayElevationChart(data, popup);
  }

  displayElevationChart(data, popup) {
    const coords = data.features[0].geometry.coordinates;
    const elevations = [];
    const distances = [];
    coords.forEach((coord, index) => {
      const elevation = this.map.queryTerrainElevation(coord) || 0;
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
      this.chart.updateData(elevations, distances);
      this.chart.canvas.classList.add('active');
    });

    popup.on('close', () => {
      this.chart.canvas.classList.remove('active');
    });
  }
}
