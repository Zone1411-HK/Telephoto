document.addEventListener('DOMContentLoaded', () => {
    startUp();
});

async function startUp() {
    try {
        if (await isLoggedIn()) {
            getChats();
            chatAddEventListeners();
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
            }
        } else {
            window.location.href = '/login';
        }
    } catch (error) {
        console.log(error);
    }
}

async function testing() {
    const response = await PostMethodFetch('/api/saveUsername', {
        username: 'testasd'
    });
}
