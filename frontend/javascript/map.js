document.addEventListener('DOMContentLoaded', () => {
    let map = L.map('map', {
        zoomControl: false,
        maxBounds: [
            [-90, -180],
            [90, 180]
        ],
        maxBoundsViscosity: 1
    }).setView([51.505, -0.09], 5);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        minZoom: 2.5,
        noWrap: true,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    let markers = L.markerClusterGroup({ maxClusterRadius: 1 });
    for (let i = 0; i < 100; i++) {
        let x = Math.floor(Math.random() * 360 - 180);
        let y = Math.floor(Math.random() * 180 - 90);
        placeMarker(x, y, map, '/images/placeholder2.gif', markers);
        map.addLayer(
            new L.Marker([y, x], {
                icon: new L.icon({
                    iconUrl: '/images/map-pin.svg',
                    iconSize: [40, 40],
                    iconAnchor: [20, 20]
                })
            })
        );
    }
    //placeMarker(-0.09, 51.505, map, '/images/placeholder2.gif', markers);

    //map.addLayer(markers);
    document.getElementById('goBack').addEventListener('click', () => {
        window.location.href = '/';
    });
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
