let socket = io();
let userTrackerArray = [];
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

function generateBarChart(arr) {
    const yAxis = document.getElementById('yAxis');
    yAxis.replaceChildren();
    const nullPoint = document.createElement('span');
    nullPoint.innerText = 0;
    yAxis.appendChild(nullPoint);
    let sortedArr = arr.slice();
    sortedArr = sortArray(sortedArr);
    let usedNums = [];
    for (let i = 0; i < sortedArr.length; i++) {
        if (!usedNums.includes(sortedArr[i])) {
            const span = document.createElement('span');
            span.innerText = sortedArr[i];
            usedNums.push(sortedArr[i]);
            yAxis.appendChild(span);
        }
    }

    let maxValue = Math.max(...arr);
    let ratio = 100 / maxValue;
    let columns = document.querySelectorAll('.userTrackerColumn');
    for (let i = 0; i < arr.length; i++) {
        columns[i].style.height = ratio * arr[i] + '%';
    }
}

socket.on('responseActiveUsers', (activeUsers) => {
    if (userTrackerArray.length >= 5) {
        userTrackerArray.shift();
    }
    userTrackerArray.push(activeUsers);
    console.log('before: ', userTrackerArray);

    generateBarChart(userTrackerArray);
    console.log('after: ', userTrackerArray);
});

function convertUnixToReadableDate(unix) {
    let date = new Date(unix);
    let hour = date.getUTCHours(date);
    let minute = date.getUTCMinutes(date).toString();
    if (minute.length == 1) {
        minute = '0' + minute;
    }
    return `${hour}:${minute}`;
}

function sortArray(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[i]) {
                let temp = arr[j];
                arr[j] = arr[i];
                arr[i] = temp;
            }
        }
    }
    return arr;
}
