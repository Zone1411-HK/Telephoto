//TODO Visszajelzést adni a felhasználónak mi a probléma

async function registration() {
    try {
        let validInputs = 0;

        let usernameInput = document.getElementById('regUsername');
        let username = usernameInput.value;
        const isUsernameAvailable = await PostMethodFetch('/api/isUsernameAvailable' + username, {
            username: username
        });
        if (!!username && isUsernameAvailable.available) {
            usernameInput.classList.remove('invalid');
            validInputs++;
        } else {
            invalidElement(usernameInput);
            validInputs--;
        }

        //? Email formátum
        //? [A-Za-z0-9]: minden nagybetű a-z-ig, minden kisbetű a-z-ig és minden szám
        //? \(char): tartalmaznia kell az adott karaktert
        const emailRegExp = /[A-Za-z0-9]\@[A-Za-z0-9]\.[A-Za-z0-9]/;
        let emailInput = document.getElementById('regEmail');
        let email = emailInput.value;
        if (emailRegExp.test(email)) {
            emailInput.classList.remove('invalid');
            validInputs++;
        } else {
            invalidElement(emailInput);
            validInputs--;
        }

        let passwordInput = document.getElementById('regPassword');
        let password = passwordInput.value;
        let notSpecialCharacters = /[^a-zA-Z0-9áéíóúőűÁÉÍÓÚŐŰ]/;
        let numbers = /[0-9]/;
        if (!!password && notSpecialCharacters.test(password) && numbers.test(password)) {
            passwordInput.classList.remove('invalid');
            validInputs++;
        } else {
            invalidElement(passwordInput);
            validInputs--;
        }

        let passwordConfirmInput = document.getElementById('regConfirmPassword');
        let passwordConfirm = passwordConfirmInput.value;
        if (
            !!passwordConfirm &&
            passwordConfirm === password &&
            notSpecialCharacters.test(passwordConfirm) &&
            numbers.test(passwordConfirm)
        ) {
            passwordConfirmInput.classList.remove('invalid');
            validInputs++;
        } else {
            invalidElement(passwordConfirmInput);
            validInputs--;
        }

        if (validInputs === 4) {
            const response = await PostMethodFetch('/api/registration', {
                username: username,
                email: email,
                password: password
            });
            console.log(response);
        }
    } catch (error) {
        console.error(`REGISZTRÁCIÓS hiba: ${error.message}`);
    }
}

function invalidElement(invalidElement) {
    invalidElement.style.animation = 'invalidShake 250ms linear 1 forwards';
    setTimeout(() => {
        invalidElement.style.animation = '';
    }, 250);
    invalidElement.classList.add('invalid');
}
