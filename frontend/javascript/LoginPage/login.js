import { GetMethodFetch, PostMethodFetch } from '../fetch.js';

export async function login() {
    try {
        let usernameInput = document.getElementById('loginUsername');
        let username = usernameInput.value;
        !username
            ? usernameInput.classList.add('invalid')
            : usernameInput.classList.remove('invalid');

        let passwordInput = document.getElementById('loginPassword');
        let password = passwordInput.value;
        !password
            ? passwordInput.parentNode.classList.add('invalid')
            : passwordInput.parentNode.classList.remove('invalid');

        if (!!username && !!password) {
            const response = await PostMethodFetch('/api/login', {
                username: username,
                password: password
            });
            if (response.isLoggedIn) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    } catch (error) {
        console.error(`LOGIN hiba: ${error.message}`);
        return false;
    }
}
