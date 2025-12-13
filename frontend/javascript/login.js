async function login() {
    try {
        let usernameInput = document.getElementById('usernameInput');
        let username = usernameInput.value;
        !username ? invalidLogin(usernameInput) : usernameInput.classList.remove('invalid');
        console.log(!username);

        let passwordInput = document.getElementById('passwordInput');
        let password = passwordInput.value;
        !password ? invalidLogin(passwordInput) : passwordInput.classList.remove('invalid');
        console.log(!password);

        if (!!username && !!password) {
            const response = await PostMethodFetch('/api/login', {
                username: username,
                password: password
            });
            if (response.isLoggedIn) {
                console.log('success');
                //TODO TOVÁBB VITEL A FŐOLDALRA
            } else {
                console.log('fail');
            }
        }
    } catch (error) {
        console.error(`LOGIN hiba: ${error.message}`);
    }
}

function invalidLogin(invalidElement) {
    invalidElement.style.animation = 'invalidShake 250ms linear 1 forwards';
    setTimeout(() => {
        invalidElement.style.animation = '';
    }, 250);
    invalidElement.classList.add('invalid');
}
