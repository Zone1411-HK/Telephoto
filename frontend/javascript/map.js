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
    //#endregion
    document.getElementById('goBack').addEventListener('click', () => {
        window.location.href = '/';
    });

    document.getElementById('modalClose').addEventListener('click', exitPost);

    //#region Legacy Kód
});

function exitPost() {
    document.getElementById('postModal').style.display = 'none';
}

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

function clusterIcon(cluster) {
    let markerCount = cluster.getChildCount();
    let clusterColorClass;
    if (markerCount < 10) {
        clusterColorClass = 'lowDensity';
    } else if (markerCount < 25) {
        clusterColorClass = 'mediumDensity';
    } else {
        clusterColorClass = 'highDensity';
    }

    let html = `
    <div class='customCluster ${clusterColorClass}'>
        ${markerCount}
    </div>`;
    return L.divIcon({ html: html });
}

function customPopup(id, link) {
    let html = document.createElement('div');
    html.addEventListener('click', openPost);
    html.dataset.postId = id;
    html.classList.add('customPopupWrapper');

    let mediaWrapper = document.createElement('div');
    mediaWrapper.classList.add('popupMediaWrapper');

    let format;
    try {
        format = link.split('.')[1];
    } catch (error) {
        format = '';
    }
    if (format == 'mp4' || format == 'avi' || format == 'hevc') {
        let video = document.createElement('video');
        let source = document.createElement('source');
        source.type = 'video/' + format;
        source.src = '/uploads/' + link;
        video.appendChild(source);
        video.pause();
        video.controls = false;
        video.classList.add('popupMedia');
        mediaWrapper.appendChild(video);
    } else {
        let img = document.createElement('img');
        img.src = '/uploads/' + link;
        img.classList.add('popupMedia');
        img.loading = 'lazy';
        mediaWrapper.appendChild(img);
    }
    html.appendChild(mediaWrapper);
    return html;
}

async function generateMarkers() {
    try {
        const { Status, Markers } = await GetMethodFetch('/api/markers');
        if (Status == 'success') {
            let markers = L.markerClusterGroup({
                maxClusterRadius: 100,
                iconCreateFunction: clusterIcon
                /*
                polygonOptions: {
                    color: '#212e00',
                    weight: 1,
                    fillColor: '#f0febe'
                }*/
            });

            /*
            for (let i = 0; i < 1000; i++) {
                let newMarker = L.marker([Math.random() * 180 - 90, Math.random() * 360 - 180]);
                let newMarkerPopup = L.popup({
                    content: `<div class='customPopupWrapper'><div class='popupImgWrapper' data-postId=''><img src='/images/placeholder2.gif' class='popupImg'/></div></div>`,
                    closeButton: false,
                    className: 'customPopup'
                });
                newMarker.bindPopup(newMarkerPopup);
                markers.addLayer(newMarker);
            }*/

            for (const marker of Markers) {
                console.log(marker);
                let newMarker = L.marker([marker.latitude, marker.longitude]);
                let newMarkerPopup = L.popup({
                    content: customPopup(marker.post_id, marker.picture_link),
                    className: 'customPopup',
                    closeButton: false
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

function openPost() {
    document.getElementById('postModal').style.display = 'flex';
}
