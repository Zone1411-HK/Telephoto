//TODO Bejelentkezés után tovább vinni a felhasználót a főoldalra
//asd
async function login() {
    try {
        let usernameInput = document.getElementById('loginUsername');
        let username = usernameInput.value;
        !username ? invalidElement(usernameInput) : usernameInput.classList.remove('invalid');

        let passwordInput = document.getElementById('loginPassword');
        let password = passwordInput.value;
        !password ? invalidElement(passwordInput) : passwordInput.classList.remove('invalid');

        if (!!username && !!password) {
            const response = await PostMethodFetch('/api/login', {
                username: username,
                password: password
            });
            if (response.isLoggedIn) {
                const result = await GetMethodFetch('/api/hashUser/' + username);
                sessionStorage.setItem('username', result.username);
                document.getElementById('login').classList.add('invisible');
                document.getElementById('home').classList.remove('invisible');
                document.getElementById('navbar').classList.remove('invisible');
                console.log('success');
            } else {
                console.log('fail');
            }
        }
    } catch (error) {
        console.error(`LOGIN hiba: ${error.message}`);
    }
}

function invalidElement(invalidElement) {
    invalidElement.style.animation = 'invalidShake 250ms linear 1 forwards';
    setTimeout(() => {
        invalidElement.style.animation = '';
    }, 250);
    invalidElement.classList.add('invalid');
}
