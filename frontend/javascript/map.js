let map;
let markerCluster = L.markerClusterGroup({
    maxClusterRadius: 100,
    iconCreateFunction: clusterIcon,

    polygonOptions: {
        color: '#859258',
        weight: 1,
        fillColor: '#b9c78a'
    }
});
let markers;
const boundLines = {
    minLatLine: L.polyline([
        [0, 180],
        [0, -180]
    ]),
    maxLatLine: null,
    minLonLine: null,
    maxLonLine: null
};

document.addEventListener('DOMContentLoaded', () => {
    generateMap();

    let isClosed = true;
    document.getElementById('filterSVGWrapper').addEventListener('click', function () {
        if (isClosed) {
            this.parentNode.style.width = '125px';
            this.parentNode.style.borderRadius = '15px';
            this.parentNode.style.height = '200px';

            setTimeout(() => {
                this.style.height = '15%';
                this.style.borderBottomLeftRadius = '0';
                this.style.borderBottomRightRadius = '0';
                document.getElementById('filterOptions').style.display = 'flex';
            }, 250);
            isClosed = false;
        } else {
            this.parentNode.style.width = '40px';
            this.parentNode.style.height = '40px';
            this.style.borderRadius = 'inherit';
            document.getElementById('filterOptions').style.display = 'none';

            setTimeout(() => {
                this.parentNode.style.borderRadius = '50%';
                this.style.height = '100%';
            }, 250);

            isClosed = true;
        }
    });

    let filterInputs = document.querySelectorAll('.filterOptionInputs input');
    for (const input of filterInputs) {
        input.value = '';
        input.addEventListener('input', filterPins);
    }

    document.getElementById('modalClose').addEventListener('click', exitPost);
    document.getElementById('resetFilter').addEventListener('click', resetFilter);
    //#region Legacy Kód
});

function filterPins() {
    let val = '';
    let dot = false;
    for (let i = 0; i < this.value.length; i++) {
        if (i == 0 && this.value[i] == '-') {
            val += this.value[i];
        }
        if (/[0-9]/.test(this.value[i])) {
            val += this.value[i];
        }
        if (!dot && this.value[i] == '.') {
            dot = true;
            if (i == 0 || (i == 1 && this.value[0] == '-')) {
                val += '0' + this.value[i];
            } else {
                val += this.value[i];
            }
        }
    }

    if (this.classList.contains('filterLat')) {
        if (val > 90) val = 90;

        if (val < -90) val = -90;
    }

    if (this.classList.contains('filterLon')) {
        if (val > 180) val = 180;

        if (val < -180) val = -180;
    }
    this.value = val;

    let min = this.parentNode.children[0];
    let max = this.parentNode.children[1];
    if (parseFloat(max.value) < parseFloat(min.value) && this == max) {
        max.classList.add('invalidFilter');
        min.classList.remove('invalidFilter');
    } else if (parseFloat(max.value) < parseFloat(min.value) && this == min) {
        max.classList.remove('invalidFilter');
        min.classList.add('invalidFilter');
    } else {
        max.classList.remove('invalidFilter');
        min.classList.remove('invalidFilter');
        markerCluster.clearLayers();
        map.removeLayer(markerCluster);

        generateFilterLines(this, max);
        generateFilteredMarkers();
    }
}

function generateFilterLines(filterInput, max) {
    let lineColor = '#212e00';
    let lineWeight = '1.5';
    let latOrLon = filterInput.classList.contains('filterLat') ? 'LatLine' : 'LonLine';
    let minOrMax = filterInput == max ? 'max' : 'min';
    let line;

    if (boundLines[minOrMax + latOrLon] != null) {
        map.removeLayer(boundLines[minOrMax + latOrLon]);
    }

    if (filterInput.value != '') {
        if (latOrLon == 'LatLine') {
            line = L.polyline(
                [
                    [parseFloat(filterInput.value), 180],
                    [parseFloat(filterInput.value), -180]
                ],
                { color: lineColor, weight: lineWeight }
            );
        } else {
            line = L.polyline(
                [
                    [90, parseFloat(filterInput.value)],
                    [-90, parseFloat(filterInput.value)]
                ],
                { color: lineColor, weight: lineWeight }
            );
        }
        boundLines[minOrMax + latOrLon] = line;
        map.addLayer(boundLines[minOrMax + latOrLon]);
    }
}

function exitPost() {
    document.getElementById('postModal').style.display = 'none';
}

async function generateMap() {
    markers = await getMarkers();
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
    generateMarkers();
}

function resetFilter() {
    let filterInputs = document.querySelectorAll('.filterOptionInputs input');
    for (const input of filterInputs) {
        input.value = '';
    }
    map.removeLayer(markerCluster);
    for (const entries of Object.entries(boundLines)) {
        if (entries[1] != null) {
            map.removeLayer(boundLines[entries[0]]);
        }
    }
    generateMarkers();
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

async function getMarkers() {
    try {
        const { Status, Markers } = await GetMethodFetch('/api/markers');
        if (Status == 'success') {
            return Markers;
        }
    } catch (error) {
        console.error(error.message);
    }
}

function generateMarkers() {
    try {
        for (const marker of markers) {
            let newMarker = L.marker([marker.latitude, marker.longitude]);
            let newMarkerPopup = L.popup({
                content: customPopup(marker.post_id, marker.picture_link),
                className: 'customPopup',
                closeButton: false
            });
            newMarker.bindPopup(newMarkerPopup);
            markerCluster.addLayer(newMarker);
        }
        map.addLayer(markerCluster);
    } catch (error) {
        console.error(error.message);
    }
}

function generateFilteredMarkers() {
    let minLat =
        document.getElementById('minLat').value == ''
            ? null
            : parseFloat(document.getElementById('minLat').value);

    let maxLat =
        document.getElementById('maxLat').value == ''
            ? null
            : parseFloat(document.getElementById('maxLat').value);

    let minLon =
        document.getElementById('minLon').value == ''
            ? null
            : parseFloat(document.getElementById('minLon').value);

    let maxLon =
        document.getElementById('maxLon').value == ''
            ? null
            : parseFloat(document.getElementById('maxLon').value);

    for (const marker of markers) {
        let toAdd = true;
        if (!!minLat && marker.latitude < minLat) {
            toAdd = false;
        }
        if (toAdd && !!maxLat && marker.latitude > maxLat) {
            toAdd = false;
        }
        console.log(minLon);
        if (toAdd && !!minLon && marker.longitude < minLon) {
            toAdd = false;
        }
        if (toAdd && !!maxLon && marker.longitude > maxLon) {
            toAdd = false;
        }
        if (toAdd) {
            let newMarker = L.marker([marker.latitude, marker.longitude]);
            let newMarkerPopup = L.popup({
                content: customPopup(marker.post_id, marker.picture_link),
                className: 'customPopup',
                closeButton: false
            });
            newMarker.bindPopup(newMarkerPopup);
            markerCluster.addLayer(newMarker);
        }
    }
    map.addLayer(markerCluster);
}

function openPost() {
    document.getElementById('postModal').style.display = 'flex';
}
