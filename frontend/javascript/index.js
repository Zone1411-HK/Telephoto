document.addEventListener('DOMContentLoaded', () => {
    /*     document.getElementById('home').addEventListener('click', () => {});
    document.getElementById('personal').addEventListener('click', () => {});
    document.getElementById('map').addEventListener('click', () => {});
    document.getElementById('profile').addEventListener('click', () => {});
    document.getElementById('postButton').addEventListener('click', () => {});

 */ document.getElementById('loginButton').addEventListener('click', login);
    document.getElementById('loginText').addEventListener('click', toggleLoginRegistration);
    document.getElementById('regButton').addEventListener('click', registration);
    document.getElementById('regText').addEventListener('click', toggleLoginRegistration);
    /*     document.getElementById('create').addEventListener('click', () => {});
    document.getElementById('settings').addEventListener('click', () => {});

    document.getElementById('today').addEventListener('click', () => {});
    document.getElementById('week').addEventListener('click', () => {});
    document.getElementById('month').addEventListener('click', () => {});
    document.getElementById('top').addEventListener('click', () => {});
    document.getElementById('new').addEventListener('click', () => {});
    document.getElementById('near').addEventListener('click', () => {});
 */
    //socket.emit('test');
    //isLoggedIn();
});

//! Ha tudtok pls adjatok neki jobb nevet 🙏
function toggleLoginRegistration() {
    const loginForm = document.getElementById('loginForm');
    loginForm.classList.toggle('invisible');

    const regForm = document.getElementById('regForm');
    regForm.classList.toggle('invisible');
}

async function isLoggedIn() {
    try {
        const response = await GetMethodFetch('/api/sendUsername');
        if (response.exists) {
            document.getElementById('home').classList.remove('invisible');
            document.getElementById('navbar').classList.remove('invisible');
            getChats();
        } else {
            document.getElementById('login').classList.remove('invisible');
        }
    } catch (error) {}
}
