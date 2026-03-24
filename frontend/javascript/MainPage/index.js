document.addEventListener('DOMContentLoaded', () => {
    //testing();
    start();
    document.getElementById('mapButton').addEventListener('click', () => {
        window.location.href = '/map';
    });
    /*     document.getElementById('home').addEventListener('click', () => {});
    document.getElementById('personal').addEventListener('click', () => {});
    document.getElementById('profile').addEventListener('click', () => {});
    document.getElementById('postButton').addEventListener('click', () => {});

 */
    /* document.getElementById('loginButton').addEventListener('click', login);
    document.getElementById('loginText').addEventListener('click', toggleLoginRegistration);
    document.getElementById('regButton').addEventListener('click', registration);
    document.getElementById('regText').addEventListener('click', toggleLoginRegistration); */
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

async function start() {
    if (await isLoggedIn()) {
        getChats();
        chatAddEventListeners();
    } else {
        window.location.href = '/login';
    }
}

async function testing() {
    const response = await PostMethodFetch('/api/saveUsername', {
        username: 'testasd'
    });
}
