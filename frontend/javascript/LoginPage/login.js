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
                const response = await PostMethodFetch('/api/saveUsername', { username: username });
                console.log(response);
                window.location = '/';
                console.log('success');
                //getChats();
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
