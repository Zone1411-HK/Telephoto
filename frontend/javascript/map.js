document.addEventListener('DOMContentLoaded', () => {
    let map = L.map('map').setView([51.505, -0.09], 5);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    let markers = L.markerClusterGroup({ maxClusterRadius: 150 });
    for (let i = 0; i < 5000; i++) {
        let x = Math.floor(Math.random() * 41);
        let y = Math.floor(Math.random() * 101);
        placeMarker(x, y, map, '/images/placeholder2.gif', markers);
    }
    //placeMarker(-0.09, 51.505, map, '/images/placeholder2.gif', markers);

    map.addLayer(markers);
});

function placeMarker(x, y, map, link, markers) {
    let marker = L.marker([y, x]);
    let popUp = L.popup({
        content: `<div class="w-100"><img class="img-fluid" src="${link}"></div>`
    });
    marker.bindPopup(popUp);
    //marker.addTo(map);
    markers.addLayer(marker);
    //let popUp = marker.bindPopup(`<img class="img-fluid" src="/images/placeholder2.gif">`);
}
