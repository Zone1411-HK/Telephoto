document.addEventListener('DOMContentLoaded', () => {
    startUp();
});

async function startUp() {
    try {
        if (await isLoggedIn()) {
            getChats();
            chatAddEventListeners();
            addEventListeners();

            if (await isAdmin()) {
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
            placeButtons[i].addEventListener('click', dunno);
        }

        for (const button of placeButtons) {
            if (button.dataset.filled != 'true') {
                button.disabled = true;
                button.classList.add('disabledButton');
            }
        }
    }

    document.getElementById('openPostUpload').addEventListener('click', openUploadModal);
}

function openUploadModal() {
    let modal = document.getElementById('uploadModal');
    let modalContent = document.getElementById('uploadModalContent');
    modal.classList.remove('hidden');
    modalContent.style.animation = 'fadeInUp 0.5s forwards';
    setTimeout(() => {
        modalContent.style.animation = '';
        modal.addEventListener('click', function (event) {
            closeModalByClickingOutside(event, modal, modalContent);
        });
    }, 500);
}

async function dunno() {
    const { status, result } = await PostMethodFetch('/api/setOffset', {
        type: 'reset',
        offset: 50
    });
    document.querySelector('.activeSort').classList.remove('activeSort');
    this.classList.add('activeSort');
    document.getElementById('posts-container').replaceChildren();
    randomPlaceSort(this.value);
}

async function testing() {
    const response = await PostMethodFetch('/api/saveUsername', {
        username: 'testasd'
    });
}
