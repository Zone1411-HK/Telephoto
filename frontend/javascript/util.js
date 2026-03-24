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

function date_yyyy_MM_dd_hh_mm_ss(originDate) {
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

    let hour = date.getHours(date);
    if (hour.length == 1) {
        hour = '0' + hour.toString();
    }

    let minute = date.getMinutes(date);
    if (minute.length == 1) {
        minute = '0' + minute.toString();
    }

    let second = date.getSeconds(date);
    if (second.length == 1) {
        second = '0' + second.toString();
    }

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

async function isLoggedIn() {
    try {
        const response = await GetMethodFetch('/api/sendUsername');
        return response.exists;
    } catch (error) {}
}

function closeModalByClickingOutside(e, modal, modalContent) {
    let clickedOutside = e.target == modal;

    if (clickedOutside) {
        modalContent.style.animation = 'fadeOutDown 0.5s forwards';

        setTimeout(() => {
            modal.classList.add('hidden');
            modalContent.style.animation = '';
        }, 500);
    }
}
