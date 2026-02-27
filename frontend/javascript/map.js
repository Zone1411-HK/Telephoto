let map;
document.addEventListener('DOMContentLoaded', () => {
    generateMap();
    /*
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

    //map.addLayer(markers);*/
    document.getElementById('goBack').addEventListener('click', () => {
        window.location.href = '/';
    });
});

async function generateMap() {
    map = L.map('map', {
        zoomControl: false,
        maxBounds: [
            [-90, -180],
            [90, 180]
        ],
        maxBoundsViscosity: 1,
        zoom: 3
    }).setView([20, 15], 2.5);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        minZoom: 3,
        noWrap: true,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OSM</a>'
    }).addTo(map);

    await generateMarkers();
}

async function generateMarkers() {
    try {
        const { Status, Markers } = await GetMethodFetch('/api/markers');
        if (Status == 'success') {
            let markers = L.markerClusterGroup({
                maxClusterRadius: 125,
                iconCreateFunction: function (cluster) {
                    let html = `
                    <div class='customCluster'>
                        <h1>${cluster.getChildCount()}</h1>
                    </div>
                    `;
                    return L.divIcon({ html: html });
                }
                /*
                polygonOptions: {
                    color: '#212e00',
                    weight: 1,
                    fillColor: '#f0febe'
                }*/
            });
            for (const marker of Markers) {
                console.log(marker);
                let newMarker = L.marker([marker.latitude, marker.longitude]);
                let newMarkerPopup = L.popup({
                    content: `<div class='' data-postId='${marker.post_id}'><img src='/uploads/${marker.picture_link}'/></div>`
                });
                newMarker.bindPopup(newMarkerPopup);
                markers.addLayer(newMarker);
            }
            map.addLayer(markers);
        }
    } catch (error) {
        console.error(error.message);
    }
    /*
    let marker = L.marker([y, x]);
    let popUp = L.popup({
        content: `<div class="w-100"><img class="img-fluid" src="${link}"></div>`
    });
    marker.bindPopup(popUp);
    //marker.addTo(map);
    markers.addLayer(marker);
    //let popUp = marker.bindPopup(`<img class="img-fluid" src="/images/placeholder2.gif">`);*/
}
