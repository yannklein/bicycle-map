import mapboxgl from 'mapboxgl';

const randomColorGen = () => "#" + Math.floor(Math.random() * 0xFFFFFF).toString(16);
 
mapboxgl.accessToken =
  'pk.eyJ1IjoieWFubmx1Y2tsZWluIiwiYSI6ImNqcnZmeHQwaDAxb2o0NGx2bG1tOWgwNGIifQ.q4zhKOCoH7nDIJNm88leXg';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/yannlucklein/cly83l5kh00jc01pr8yx7a3ye',
  zoom: 5,
  center: [138.2529, 36.2048],
});

map.on('load', () => {
  for (let i = 0; i < 10; i += 1) {
    map.addSource(`bicycle-trip-${i}`, {
      type: 'geojson',
      data: `./bicycle-trips/bicycle-trip-${i}.geojson`,
    });

    map.addLayer({
      id: `bicycle-trip-layer-${i}`,
      type: 'line',
      source: `bicycle-trip-${i}`,
      paint: {
        'line-width': 3,
        'line-color': randomColorGen(),
      },
    });
  }
});
