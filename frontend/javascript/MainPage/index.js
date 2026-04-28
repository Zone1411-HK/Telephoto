import * as utilFunctions from '../util.js';
import * as chatFunctions from './chat.js';
import * as postFunctions from './post.js';
import * as uploadPostFunctions from './uploadPost.js';
import * as scrollFunctions from './scroll.js';
import { GetMethodFetch, PostMethodFetch } from '../fetch.js';

let matchMedia = window.matchMedia('(width > 1000px)');
let scrollDistance = 0;

document.addEventListener('DOMContentLoaded', () => {
    startUp();
});

window.addEventListener('resize', () => {
    let item = document.getElementById('posts-container');
    if (matchMedia.matches) {
        item.addEventListener('wheel', function (event) {
            scrollFunctions.scrollHorizontal(event, item, matchMedia);
        });
        item.removeEventListener('wheel', scrollFunctions.hideTitleMobile);

        document.getElementById('mobileSort').classList.add('hidden');
        document.getElementById('openSort').dataset.opened = 'false';
    } else {
        item.removeEventListener('wheel', function (event) {
            scrollFunctions.scrollHorizontal(event, matchMedia);
        });
        item.addEventListener('wheel', function () {
            scrollDistance = scrollFunctions.hideTitleMobile(item, scrollDistance);
        });
    }
});

async function startUp() {
    try {
        if (await utilFunctions.isLoggedIn()) {
            chatFunctions.getChats();
            chatFunctions.chatAddEventListeners();
            addEventListeners();
            postFunctions.startUpPosts();

            document
                .getElementById('cancelPost')
                .addEventListener('click', uploadPostFunctions.closePost);
            document
                .getElementById('uploadFile')
                .addEventListener('change', uploadPostFunctions.preLoadFiles);
            document
                .getElementById('uploadDescription')
                .addEventListener('keyup', uploadPostFunctions.currentDescriptionLength);
            document.getElementById('uploadTags').addEventListener('keydown', function (e) {
                if (e.key == 'Enter') {
                    e.preventDefault();
                    uploadPostFunctions.generateTag(this);
                }
                if (e.key == '#') {
                    e.preventDefault();
                }
            });

            let item = document.getElementById('posts-container');
            if (matchMedia.matches) {
                item.addEventListener('wheel', function (event) {
                    scrollFunctions.scrollHorizontal(event, item, matchMedia);
                });
            } else {
                item.addEventListener('wheel', function () {
                    console.log(scrollDistance);
                    scrollDistance = scrollFunctions.hideTitleMobile(item, scrollDistance);
                });
            }

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
    } catch (error) {
        console.error(error);
    }
}

async function addEventListeners() {
    let randomPlacesResponse = await GetMethodFetch('/api/randomPlaces');
    if (randomPlacesResponse.Status == 'success') {
        let placeButtons = document.querySelectorAll('.egyebButton');

        for (let i = 0; i < randomPlacesResponse.places.length; i++) {
            placeButtons[i].value = randomPlacesResponse.places[i].location;
            placeButtons[i].dataset.filled = 'true';
            placeButtons[i].disabled = false;
            placeButtons[i].classList.remove('disabledButton');
            placeButtons[i].addEventListener('click', searchRandomPlaces);
        }

        for (const button of placeButtons) {
            if (button.dataset.filled != 'true') {
                button.disabled = true;
                button.classList.add('disabledButton');
            }
        }
    }
    document.getElementById('mobileUpload').addEventListener('click', openUploadModal);
    document.getElementById('openPostUpload').addEventListener('click', openUploadModal);
}

function openUploadModal() {
    let modal = document.getElementById('uploadModal');
    let modalContent = document.getElementById('uploadModalContent');
    let flash = document.getElementById('flash');
    modal.classList.remove('hidden');
    modalContent.style.animation = 'fadeInUp 0.5s forwards';
    setTimeout(() => {
        modalContent.style.animation = '';
        modal.addEventListener('click', function (event) {
            utilFunctions.closeModalByClickingOutside(event, modal, modalContent);
        });
    }, 500);
}

async function searchRandomPlaces() {
    const { status, result } = await PostMethodFetch('/api/setOffset', {
        type: 'reset',
        offset: 50
    });
    for (const element of document.querySelectorAll('.activeSort')) {
        element.classList.remove('activeSort');
    }
    this.classList.add('activeSort');
    document.getElementById('posts-container').replaceChildren();
    postFunctions.randomPlaceSort(this.value);
}
