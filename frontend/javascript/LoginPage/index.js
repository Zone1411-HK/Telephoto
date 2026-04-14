import { login } from './login.js';
import { registration } from './registration.js';

let matchMedia = window.matchMedia('(width > 768px)');

document.addEventListener('DOMContentLoaded', () => {
    loginAddEventListeners();
});

function loginAddEventListeners() {
    document.getElementById('loginButton').addEventListener('click', login);
    document.getElementById('registrationButton').addEventListener('click', submitRegistration);
    document.getElementById('switchToRegistration').addEventListener('click', switchToRegistration);
    document.getElementById('switchToLogin').addEventListener('click', switchToLogin);

    let showPasswordButtons = document.querySelectorAll('.showPasswordButton');
    for (const button of showPasswordButtons) {
        button.addEventListener('click', togglePasswordVisibility);
    }
}

async function submitRegistration() {
    let response = await registration();
    console.log(response.success);
    document.getElementById('registrationFeedback').classList.remove('animFadeOutUp');
    document.getElementById('registrationFeedback').classList.add('animFadeInDown');
    setTimeout(() => {
        document.getElementById('registrationFeedback').classList.remove('animFadeInDown');
        document.getElementById('registrationFeedback').classList.add('animFadeOutUp');
    }, 5000);

    if (response.success) {
        document.getElementById('registrationStatus').innerText = 'Sikeres';
        document.getElementById('registrationMessage').innerText = 'Sikeres regisztráció';
        document.getElementById('registrationStatus').classList.remove('failedRegistration');
        document.getElementById('registrationStatus').classList.add('successfulRegistration');
        switchToLogin();
    } else {
        document.getElementById('registrationStatus').innerText = 'Sikertelen';
        document.getElementById('registrationMessage').innerText = response.errorMessage;
        document.getElementById('registrationStatus').classList.remove('successfulRegistration');
        document.getElementById('registrationStatus').classList.add('failedRegistration');
    }
}

function togglePasswordVisibility() {
    if (this.dataset.visible == 'false') {
        this.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye-off"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
        this.dataset.visible = 'true';
        this.parentNode.children[0].type = 'text';
    } else {
        this.dataset.visible = 'false';
        this.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
        this.parentNode.children[0].type = 'password';
    }
}

function switchToRegistration() {
    document.getElementById('loginDiv').classList.remove('animFadeInUp');
    document.getElementById('loginDiv').classList.add('animFadeOutUp');
    setTimeout(() => {
        document.getElementById('loginDiv').classList.add('hidden');
        document.getElementById('registrationDiv').classList.remove('hidden');
        document.getElementById('registrationDiv').classList.add('animFadeInUp');
        document.getElementById('loginDiv').classList.remove('animFadeOutUp');
    }, 500);
}

function switchToLogin() {
    document.getElementById('registrationDiv').classList.remove('animFadeInUp');
    document.getElementById('registrationDiv').classList.add('animFadeOutDown');
    setTimeout(() => {
        document.getElementById('registrationDiv').classList.add('hidden');
        document.getElementById('loginDiv').classList.remove('hidden');
        document.getElementById('loginDiv').classList.add('animFadeInDown');
        document.getElementById('registrationDiv').classList.remove('animFadeOutDown');
    }, 500);
}
