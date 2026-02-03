document.addEventListener('DOMContentLoaded', () => {
    test();
    document.getElementById('home').addEventListener('click', () => {});
    document.getElementById('personal').addEventListener('click', () => {});
    document.getElementById('map').addEventListener('click', () => {});
    document.getElementById('profile').addEventListener('click', () => {});
    document.getElementById('postButton').addEventListener('click', () => {});

    document.getElementById('loginButton').addEventListener('click', login);
    document.getElementById('loginText').addEventListener('click', toggleLoginRegistration);
    document.getElementById('regButton').addEventListener('click', registration);
    document.getElementById('regText').addEventListener('click', toggleLoginRegistration);
    document.getElementById('create').addEventListener('click', () => {});
    document.getElementById('settings').addEventListener('click', () => {});

    document.getElementById('today').addEventListener('click', () => {});
    document.getElementById('week').addEventListener('click', () => {});
    document.getElementById('month').addEventListener('click', () => {});
    document.getElementById('top').addEventListener('click', () => {});
    document.getElementById('new').addEventListener('click', () => {});
    document.getElementById('near').addEventListener('click', () => {});
});

//! Ha tudtok pls adjatok neki jobb nevet 🙏
function toggleLoginRegistration() {
    const loginForm = document.getElementById('loginForm');
    loginForm.classList.toggle('invisible');

    const regForm = document.getElementById('regForm');
    regForm.classList.toggle('invisible');
}

async function test() {
    let accessToken = localStorage.getItem('accessToken');
    try {
        const response = await fetch('/api/testAccessToken', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        if (!data.isValid) {
            document.getElementById('login').classList.remove('invisible');
        } else {
            document.getElementById('home').classList.remove('invisible');
            console.log(localStorage.getItem('accessToken'));
            const refreshAccess = await fetch('/api/updateAccessToken', {
                method: 'POST',
                credentials: 'include'
            });
            if (refreshAccess.status != 200) {
                console.error('A refresh nem működött!');
            } else {
                const refreshedToken = await refreshAccess.json();
                console.log(refreshedToken);
                localStorage.setItem('accessToken', refreshedToken.newAccessToken);
                console.log(localStorage.getItem('accessToken'));
                console.log('Sikeres token refresh');
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}
