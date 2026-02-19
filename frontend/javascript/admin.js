let socket = io();
let userTrackerArray = [];
let userTrackerTimeArray = [];

socket.emit('requestActiveUsers');
setInterval(() => {
    socket.emit('requestActiveUsers');
}, 1500);

document.addEventListener('DOMContentLoaded', () => {
    getProfiles();
    getPosts();
    getComments();
    responsiveUsername();

    const navButtons = document.getElementsByClassName('navButton');
    for (const navButton of navButtons) {
        navButton.addEventListener('click', navButtonClick);
    }

    const searches = document.getElementsByClassName('searchId');
    for (const search of searches) {
        search.addEventListener('click', searchFocus);
    }

    let sidebar = document.getElementById('sidebar');
    toggleSidebarVisibility(sidebar);

    let collapseSidebarBtn = document.getElementById('collapseSidebar');
    collapseSidebarBtn.addEventListener('click', collapseSidebar);
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
                    username.style.fontSize = '22px';
                } else {
                    username.style.fontSize = '26px';
                }
            } else {
                username.style.fontSize = '36px';
            }
        } else {
            username.style.fontSize = '40px';
        }
    } else {
        username.style.fontSize = '50px';
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

    generateBarChart(userTrackerArray);
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

function navButtonClick() {
    const navButtons = document.getElementsByClassName('navButton');
    for (const navButton of navButtons) {
        console.log(navButton == this);
        if (navButton != this) {
            navButton.classList.remove('activeNavButton');
        } else {
            this.classList.add('activeNavButton');
        }
    }
}

function searchFocus() {
    const searches = document.getElementsByClassName('searchId');
    for (const search of searches) {
        if (this == search) {
            search.parentNode.classList.add('focusSearch');
        } else {
            search.parentNode.classList.remove('focusSearch');
        }
    }
}

async function getProfiles() {
    try {
        const response = await GetMethodFetch('/api/getProfilesAdmin');
        const result = response.Result;
        const tbody = document.getElementById('profilesTbody');
        tbody.replaceChildren();
        for (const obj of result) {
            const tr = document.createElement('tr');
            const values = Object.entries(obj);

            for (let i = 0; i < values.length - 2; i++) {
                const td = document.createElement('td');
                td.innerText = values[i][1];
                if (values[i][0] == 'userId') {
                    tr.dataset.userId = values[i][1];
                }
                tr.appendChild(td);
            }
            if (values[6][1] == true) {
                tr.classList.add('adminProfile');
            } else {
                if (values[7][1] == true) {
                    tr.classList.add('reportedProfile');
                }
            }
            tr.addEventListener('click', openProfile);
            tbody.appendChild(tr);
        }
    } catch (error) {
        console.error(error);
    }
}

async function getPosts() {
    try {
        const response = await GetMethodFetch('/api/getPostsAdmin');
        const result = response.Result;
        const tbody = document.getElementById('postsTbody');
        tbody.replaceChildren();
        for (const obj of result) {
            const tr = document.createElement('tr');
            const values = Object.values(obj);
            for (const value of values) {
                const td = document.createElement('td');
                td.innerText = value;
                tr.appendChild(td);
                tr.addEventListener('click', openPost);
            }
            tbody.appendChild(tr);
        }
    } catch (error) {
        console.error('Galiba támadt');
    }
}

async function getComments() {
    try {
        const response = await GetMethodFetch('/api/getCommentsAdmin');
        const result = response.Result;
        const tbody = document.getElementById('commentsTbody');
        tbody.replaceChildren();
        for (const obj of result) {
            const tr = document.createElement('tr');
            const values = Object.entries(obj);
            for (let i = 0; i < values.length; i++) {
                const td = document.createElement('td');

                if (values[i][0] == 'commentContent') {
                    const div = document.createElement('div');
                    div.classList.add('commentContent');
                    div.innerText = values[i][1];
                    td.appendChild(div);
                } else {
                    td.innerText = values[i][1];
                }
                tr.appendChild(td);
                tr.addEventListener('click', openComment);
            }
            tbody.appendChild(tr);
        }
    } catch (error) {
        console.error('Galiba támadt');
    }
}

async function openProfile() {
    const userId = this.dataset.userId;
    console.log(userId);
}

async function openPost() {}

async function openComment() {}
