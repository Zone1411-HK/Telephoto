let socket = io();
let userTrackerArray = [];
let userTrackerTimeArray = [];
document.addEventListener('DOMContentLoaded', () => {
    socket.emit('requestActiveUsers');
    setInterval(() => {
        socket.emit('requestActiveUsers');
    }, 15000);
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

    let maxValue = Math.max(...arr);
    /*
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
    */
    for (let i = 1; i < 5; i++) {
        const span = document.createElement('span');
        span.innerText = maxValue * (i / 4);
        yAxis.appendChild(span);
    }

    let ratio = 100 / maxValue;
    let columnDiv = document.getElementById('userTrackerColumns');
    columnDiv.replaceChildren();
    let timeDiv = document.getElementById('userTrackerTimes');
    timeDiv.replaceChildren();
    for (let i = 0; i < arr.length; i++) {
        let column = document.createElement('div');
        column.classList.add('userTrackerColumn');
        column.style.height = ratio * arr[i] + '%';

        let tooltip = document.createElement('span');
        tooltip.classList.add('userTrackerTooltip');
        tooltip.innerText = arr[i];
        console.log(ratio * arr[i]);
        if (ratio * arr[i] < 40) {
            tooltip.style.paddingTop = '5%';
            tooltip.style.fontSize = '0.6vw';
        } else {
            tooltip.style.fontSize = '0.85vw';
        }

        column.appendChild(tooltip);
        columnDiv.appendChild(column);

        let span = document.createElement('span');
        span.innerText = userTrackerTimeArray[i];
        timeDiv.appendChild(span);
    }
}

socket.on('responseActiveUsers', (activeUsers) => {
    if (userTrackerArray.length >= 5) {
        userTrackerArray.shift();
        userTrackerTimeArray.shift();
    }
    userTrackerTimeArray.push(convertToTime(Date.now()));
    userTrackerArray.push(activeUsers);
    console.log('before: ', userTrackerArray);

    generateBarChart(userTrackerArray);
    console.log('after: ', userTrackerArray);
});

function convertToTime(unix) {
    let date = new Date(unix);
    let hour = date.getUTCHours(date);
    hour++;
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

async function deletePost() {
    const response = await PostMethodFetch('/api/deletePost', {
        postId: 6
    });
    if (response.Status == 'Failed') {
        console.log(response.Message);
    } else {
        console.log('Sikeresen törölte a posztot');
    }
}
