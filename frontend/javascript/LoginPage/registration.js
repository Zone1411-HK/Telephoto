//TODO Visszajelzést adni a felhasználónak mi a probléma

async function registration() {
    try {
        let validInputs = 0;

        let usernameInput = document.getElementById('registrationUsername');
        let username = usernameInput.value;
        if (username != '' && username.replace(/\s/g, '').length != 0) {
            const isUsernameAvailable = await GetMethodFetch(
                '/api/isUsernameAvailable/' + username
            );
            if (isUsernameAvailable.available) {
                usernameInput.classList.remove('invalid');
                validInputs++;
            } else {
                usernameInput.classList.add('invalid');
                validInputs--;
            }
        } else {
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
            emailInput.classList.add('invalid');
            validInputs--;
        }

        let passwordInput = document.getElementById('registrationPassword');
        let password = passwordInput.value;
        let notSpecialCharacters = /[^a-zA-Z0-9áéíóúőűÁÉÍÓÚŐŰ]/;
        let numbers = /[0-9]/;
        if (!!password && notSpecialCharacters.test(password) && numbers.test(password)) {
            passwordInput.parentNode.classList.remove('invalid');
            validInputs++;
        } else {
            passwordInput.parentNode.classList.add('invalid');
            validInputs--;
        }

        let passwordConfirmInput = document.getElementById('registrationPasswordConfirm');
        let passwordConfirm = passwordConfirmInput.value;
        if (
            !!passwordConfirm &&
            passwordConfirm === password &&
            notSpecialCharacters.test(passwordConfirm) &&
            numbers.test(passwordConfirm)
        ) {
            passwordConfirmInput.parentNode.classList.remove('invalid');
            validInputs++;
        } else {
            passwordConfirmInput.parentNode.classList.add('invalid');
            validInputs--;
        }

        if (validInputs === 4) {
            const response = await PostMethodFetch('/api/registration', {
                username: username,
                email: email,
                password: password
            });
            console.log(response);
            usernameInput.value = '';
            emailInput.value = '';
            passwordConfirmInput.value = '';
            passwordInput.value = '';
            if (response.status == 'Successful registration') {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } catch (error) {
        console.error(`REGISZTRÁCIÓS hiba: ${error.message}`);
        return false;
    }
}
