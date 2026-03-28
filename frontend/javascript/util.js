function date_yyyy_MM_dd(originDate) {
    const date = new Date(originDate);
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    if (month.toString().length == 1) {
        month = '0' + month.toString();
    }

    let day = date.getDate(date);
    if (day.toString().length == 1) {
        day = '0' + day.toString();
    }
    return `${year}-${month}-${day}`;
}

async function isLoggedIn() {
    try {
        const response = await GetMethodFetch('/api/sendUsername');
        return response.exists;
    } catch (error) {}
}

function nextSlide() {
    this.style.pointerEvents = 'none';
    setTimeout(() => {
        this.style.pointerEvents = 'all';
    }, 1);
    slideShow(1);
}

function previousSlide() {
    this.style.pointerEvents = 'none';
    setTimeout(() => {
        this.style.pointerEvents = 'all';
    }, 1);
    slideShow(-1);
}
