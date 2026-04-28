import { GetMethodFetch, PostMethodFetch } from '../fetch.js';

export async function registration() {
    try {
        let validInputs = 0;
        let errorMessage = '';
        let usernameInput = document.getElementById('registrationUsername');
        let username = usernameInput.value;
        if (username != '' && username.replace(/\s/g, '').length >= 3) {
            const isUsernameAvailable = await GetMethodFetch(
                '/api/isUsernameAvailable/' + username
            );
            if (isUsernameAvailable.available) {
                usernameInput.classList.remove('invalid');
                validInputs++;
            } else {
                usernameInput.classList.add('invalid');
                errorMessage += 'Ez a felhasználónév már foglalt!\n';
                validInputs--;
            }
        } else {
            errorMessage += 'Nem elég hosszú felhasználónév!\n';
            usernameInput.classList.add('invalid');
            validInputs--;
        }

        //? Email formátum
        //? [A-Za-z0-9]: minden nagybetű a-z-ig, minden kisbetű a-z-ig és minden szám
        //? \char: tartalmaznia kell az adott karaktert
        const emailRegExp = /^[A-Za-z0-9]+@[A-Za-z0-9]+\.[A-Za-z0-9]/;
        let emailInput = document.getElementById('registrationEmail');
        let email = emailInput.value;
        if (emailRegExp.test(email)) {
            emailInput.classList.remove('invalid');
            validInputs++;
        } else {
            errorMessage += 'Nem megfelelő e-mail formátum!\n';

            emailInput.classList.add('invalid');
            validInputs--;
        }

        let passwordInput = document.getElementById('registrationPassword');
        let password = passwordInput.value;
        let notSpecialCharacters = /[^a-zA-Z0-9áéíóúőűÁÉÍÓÚŐŰ]/;
        let numbers = /[0-9]/;
        if (
            password &&
            notSpecialCharacters.test(password) &&
            numbers.test(password) &&
            password.length >= 8
        ) {
            passwordInput.parentNode.classList.remove('invalid');
            validInputs++;
        } else {
            errorMessage += 'A jelszó nem elég erős!\n';
            passwordInput.parentNode.classList.add('invalid');
            validInputs--;
        }

        let passwordConfirmInput = document.getElementById('registrationPasswordConfirm');
        let passwordConfirm = passwordConfirmInput.value;
        if (passwordConfirm && passwordConfirm === password) {
            passwordConfirmInput.parentNode.classList.remove('invalid');
            validInputs++;
        } else {
            errorMessage += 'A két jelszó nem egyezik meg!\n';

            passwordConfirmInput.parentNode.classList.add('invalid');
            validInputs--;
        }

        if (validInputs === 4) {
            const response = await PostMethodFetch('/api/registration', {
                username: username,
                email: email,
                password: password
            });
            emailInput.value = '';
            usernameInput.value = '';
            passwordConfirmInput.value = '';
            passwordInput.value = '';
            if (response.status == 'Successful registration') {
                return { success: true };
            } else {
                return { success: false, errorMessage: errorMessage };
            }
        } else {
            return { success: false, errorMessage: errorMessage };
        }
    } catch (error) {
        console.error(`REGISZTRÁCIÓS hiba: ${error.message}`);
    }
}
