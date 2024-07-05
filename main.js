import mapboxgl from 'mapboxgl';

mapboxgl.accessToken = 'pk.eyJ1IjoieWFubmx1Y2tsZWluIiwiYSI6ImNqcnZmeHQwaDAxb2o0NGx2bG1tOWgwNGIifQ.q4zhKOCoH7nDIJNm88leXg';

new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/yannlucklein/cly83l5kh00jc01pr8yx7a3ye',
    zoom: 5,
    center: [138.2529, 36.2048]
});

