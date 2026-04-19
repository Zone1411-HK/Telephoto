import * as utilFunctions from '../util.js';
import { GetMethodFetch } from '../fetch.js';

let map;
let markerCluster;

let markers;
let boundLines;
let isClosed = true;

export async function startUp() {
    if (await utilFunctions.isLoggedIn()) {
        if (await utilFunctions.isAdmin()) {
            let adminNav = document.createElement('a');
            adminNav.href = '/admin';
            adminNav.classList.add('navButton');
            adminNav.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg><span>Admin</span>`;

            document.getElementById('nav').appendChild(adminNav);

            let adminNavMobile = document.createElement('a');
            adminNavMobile.href = '/admin';
            adminNavMobile.classList.add('mobileIcon');
            adminNavMobile.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;

            document.getElementById('navMobile').appendChild(adminNavMobile);
        }

        generateMap();

        document.getElementById('filterSVGWrapper').addEventListener('click', toggleFilter);

        markerCluster = L.markerClusterGroup({
            maxClusterRadius: 100,
            iconCreateFunction: clusterIcon,

            polygonOptions: {
                color: '#859258',
                weight: 1,
                fillColor: '#b9c78a'
            }
        });

        boundLines = {
            minLatLine: L.polyline([
                [0, 180],
                [0, -180]
            ]),
            maxLatLine: null,
            minLonLine: null,
            maxLonLine: null
        };

        let filterInputs = document.querySelectorAll('.filterOptionInputs input');
        for (const input of filterInputs) {
            input.value = '';
            input.addEventListener('input', filterPins);
        }

        document.getElementById('modalClose').addEventListener('click', exitPost);
        document.getElementById('resetFilter').addEventListener('click', resetFilter);
        document
            .getElementById('closeComments')
            .addEventListener('click', utilFunctions.closeComments);
        document
            .getElementById('commentSvgWrapper')
            .addEventListener('click', utilFunctions.sendComment);

        let { Status, exists, Result } = await GetMethodFetch('/api/sendUsername');
        if (Status == 'Success' && exists) {
            let profileURL = new URL('/profile', 'http://127.0.0.1:3000/');
            profileURL.searchParams.set('username', Result);
            document.getElementById('profilGomb').href = profileURL;
            document.getElementById('mobileProfilGomb').href = profileURL;
        }
    } else {
        window.location.href = '/login';
    }
}

export function toggleFilter() {
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
        this.style.height = '100%';
        document.getElementById('filterOptions').style.display = 'none';

        setTimeout(() => {
            this.parentNode.style.borderRadius = '50%';
        }, 250);

        isClosed = true;
    }
}

export function filterPins() {
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
    if (val != '-' && val != '.') {
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
}

export function generateFilterLines(filterInput, max) {
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

export function exitPost() {
    let modal = document.getElementById('postModal');
    modal.removeEventListener('click', utilFunctions.closeModalByClickingOutside);
    modal.children[1].style.animation = 'fadeOutDown 0.5s forwards';
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.children[1].style.animation = '';
    }, 500);
}

export async function generateMap() {
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

export function resetFilter() {
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
    markerCluster.clearLayers();
    generateMarkers();
}

export function clusterIcon(cluster) {
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

export function customPopup(id, link) {
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

export async function getMarkers() {
    try {
        const { Status, Markers } = await GetMethodFetch('/api/markers');
        if (Status == 'success') {
            return Markers;
        }
    } catch (error) {
        console.error(error.message);
    }
}

export function generateMarkers() {
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

export function generateFilteredMarkers() {
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

export async function openPost() {
    let postId = this.dataset.postId;
    let { Status, Infos } = await GetMethodFetch('/api/postInfos/' + postId);

    if (Status == 'Success') {
        console.log(Infos);
        let modal = document.getElementById('postModal');
        let content = document.getElementById('modalContent');
        content.style.animation = 'fadeInUp 0.5s forwards';
        modal.removeEventListener('click', utilFunctions.closeModalByClickingOutside);
        modal.classList.remove('hidden');
        modal.addEventListener('click', function (event) {
            utilFunctions.closeModalByClickingOutside(event, modal, content);
        });

        content.replaceChildren();

        let post = document.createElement('div');
        post.classList.add('post');

        let slideshow = utilFunctions.generateSlideshow(Infos.links);

        let timestamp = utilFunctions.generateTimestamp(Infos.creation_date);
        slideshow.appendChild(timestamp);

        let tags = utilFunctions.generateTags(Infos.tags, Infos.location);

        let description = utilFunctions.generateDescription(Infos.description);

        let interactionRow = await utilFunctions.generateInteractions(
            Infos.interactions[0].like,
            Infos.interactions[0].dislike,
            Infos.interactions[0].favorite,
            Infos.post_id,
            Infos.upvote,
            Infos.downvote
        );

        let userRow = utilFunctions.generateUserRow(Infos.username, Infos.profile_picture_link);

        let postcontent = document.createElement('div');
        postcontent.classList.add('postContent');

        postcontent.appendChild(slideshow);

        postcontent.appendChild(interactionRow);
        postcontent.appendChild(userRow);
        postcontent.appendChild(tags);
        postcontent.appendChild(description);

        post.appendChild(postcontent);
        post.dataset.postId = Infos.post_id;

        content.appendChild(post);
    }
}
