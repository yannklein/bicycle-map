import mapboxgl from 'mapboxgl';

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

map.on('load', () => {
  for (let i = 0; i < 10; i += 1) {
    map.addSource(`bicycle-trip-${i}`, {
      type: 'geojson',
      data: `./bicycle-trips/bicycle-trip-${i}.geojson`,
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

    // Create a popup, but don't add it to the map yet.
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    map.on('mouseenter', `bicycle-trip-layer-${i}`, (e) => {
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = 'pointer';

      // Copy coordinates array.
      const coordinates = e.features[0].geometry.coordinates.slice();
      const description = e.features[0].properties.Name;
      console.log(description);

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      if (['mercator', 'equirectangular'].includes(map.getProjection().name)) {
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
      }

      // Populate the popup and set its coordinates
      // based on the feature found.
      const midCoord = coordinates[Math.round(coordinates.length / 2)];
      const [title, info] = description.split(' | ');
      const popupElement = `
        <div class="popup">
          <i class="icon fa-solid fa-person-biking"></i>
          <h4>${title}</h4>
          <p>${info}</p>
        </div>
      `;
      popup.setLngLat(midCoord).setHTML(popupElement).addTo(map);
    });

    map.on('mouseleave', `bicycle-trip-layer-${i}`, () => {
      setTimeout(() => {
        map.getCanvas().style.cursor = '';
        popup.remove();
      }, 1000);
    });
  }
});
