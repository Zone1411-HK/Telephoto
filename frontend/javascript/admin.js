let socket = io();
//console.log(chartJS);
document.addEventListener('DOMContentLoaded', () => {
    setInterval(() => {
        socket.emit('requestActiveUsers');
    }, 1000);
    let sidebar = document.getElementById('sidebar');
    toggleSidebarVisibility(sidebar);

    let collapseSidebarBtn = document.getElementById('collapseSidebar');
    collapseSidebarBtn.addEventListener('click', collapseSidebar);

    responsiveUsername();
});

function collapseSidebar() {
    let sidebar = document.getElementById('sidebar');
    let adminContent = document.getElementById('adminContent');
    let isCollapsed = sidebar.dataset.collapsed;

    if (isCollapsed == 'true') {
        sidebar.style.width = '10vw';
        adminContent.style.width = '90vw';
        sidebar.dataset.collapsed = 'false';
        this.style.left = '9vw';
    } else {
        sidebar.style.width = '2vw';
        adminContent.style.width = '98vw';
        sidebar.dataset.collapsed = 'true';
        this.style.left = '1vw';
    }
    for (const child of this.children) {
        child.classList.toggle('visible');
        child.classList.toggle('invisible');
    }
    toggleSidebarVisibility(sidebar);
}

function toggleSidebarVisibility(parent) {
    let children = parent.children;
    for (let i = 1; i < children.length; i++) {
        console.log(children[i].style.visibility);
        if (children[i].style.visibility == 'visible') {
            children[i].style.visibility = 'hidden';
        } else {
            children[i].style.visibility = 'visible';
        }
    }
}

function responsiveUsername() {
    let username = document.getElementById('adminUsername');
    let length = username.innerText.length;
    if (length > 5) {
        if (length > 8) {
            if (length > 11) {
                if (length > 15) {
                    username.style.fontSize = '20px';
                } else {
                    username.style.fontSize = '24px';
                }
            } else {
                username.style.fontSize = '34px';
            }
        } else {
            username.style.fontSize = '38px';
        }
    } else {
        username.style.fontSize = '48px';
    }
}

socket.on('responseActiveUsers', (activeUsers) => {});

function convertUnixToReadableDate(unix) {
    let date = new Date(unix);
    let hour = date.getUTCHours(date);
    let minute = date.getUTCMinutes(date).toString();
    if (minute.length == 1) {
        minute = '0' + minute;
    }
    return `${hour}:${minute}`;
}
