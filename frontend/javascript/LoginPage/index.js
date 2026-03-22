document.addEventListener('DOMContentLoaded', () => {
    loginAddEventListeners();
});

function loginAddEventListeners() {
    document.getElementById('loginButton').addEventListener('click', login);
    document.getElementById('loginText').addEventListener('click', toggleLoginRegistration);
    document.getElementById('regButton').addEventListener('click', registration);
    document.getElementById('regText').addEventListener('click', toggleLoginRegistration);
}

//! Ha tudtok pls adjatok neki jobb nevet 🙏
function toggleLoginRegistration() {
    const loginForm = document.getElementById('loginForm');
    loginForm.classList.toggle('invisible');

    const regForm = document.getElementById('regForm');
    regForm.classList.toggle('invisible');
}
