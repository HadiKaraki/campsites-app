mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // id of div containing the map (which is in this case = map)
    style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
    // site = geoData.body.features[0] (features is an array)
    center: site.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
    .setLngLat(site.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
        .setHTML(
            `<h3>${site.title}</h3><p>${site.location}</p>`
        )
    )
    .addTo(map)