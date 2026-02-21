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

    document.getElementById('profileBack').addEventListener('click', closeProfile);
    document.getElementById('profActionModify').addEventListener('click', modifyProfile);
    document
        .getElementById('profActionConfirmModify')
        .addEventListener('click', confirmModificationProfile);
    document.getElementById('profActionBan').addEventListener('click', deleteProfile);
    document.getElementById('deleteCancel').addEventListener('click', closeDeleteModal);
    document.getElementById('deleteConfirm').addEventListener('click', confirmDelete);
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
                tr.dataset.admin = true;
            }

            if (values[7][1] == true) {
                tr.classList.add('reportedProfile');
                tr.dataset.reported = true;
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
    const { Status, ProfileData } = await GetMethodFetch('/api/getProfileData/' + userId);
    if (Status == 'Success' && ProfileData.length != 0) {
        document.getElementById('openedProfile').style.display = 'flex';
        document.getElementById('openedProfile').dataset.userId = userId;
        document.getElementById('profilesTableDiv').style.display = 'none';
        document.getElementById('profileBack').style.display = 'flex';

        if (this.dataset.admin == 'true') {
            document.getElementById('openedProfile').classList.add('adminProfile');
        }

        if (this.dataset.reported == 'true') {
            document.getElementById('openedProfile').classList.add('reportedProfile');
            document.getElementById('profActionClearH3').addEventListener('click', clearProfile);
            document.getElementById('profActionClearH3').classList.remove('disabledButton');
            document.getElementById('profActionClearH3').classList.add('profActionClearEnabled');
        } else {
            document.getElementById('profActionClearH3').classList.add('disabledButton');
            document.getElementById('profActionClearH3').removeEventListener('click', clearProfile);
            document.getElementById('profActionClearH3').classList.remove('profActionClearEnabled');
        }

        const date = new Date(ProfileData[0].registration_date);
        const year = date.getUTCFullYear();
        let month = date.getUTCMonth() + 1;
        if (month.toString().length == 1) {
            month = '0' + month.toString();
        }

        let day = date.getUTCDate(date);
        if (day.toString().length == 1) {
            day = '0' + day.toString();
        }
        console.log();
        document.getElementById('profileUsername').value = ProfileData[0].username;
        document.getElementById('profileRegDate').value = `${year}-${month}-${day}`;
        document.getElementById('profileEmail').value = ProfileData[0].email;
        document.getElementById('profileId').innerText = ProfileData[0].user_id;
        document.getElementById('profileBiography').value = ProfileData[0].biography;
        if (ProfileData[0].profile_picture_link != null) {
            document.getElementById('profilePic').src =
                '/uploads/' + ProfileData[0].profile_picture_link;
        } else {
            document.getElementById('profilePic').src = '/images/defaultProfile.svg';
        }
    } else {
        alert('Valami probléma történt.\n\nKérjük próbálja meg később.');
    }
}

let originalData;

function modifyProfile() {
    originalData = {};
    this.style.display = 'none';
    document.getElementById('profActionConfirmModify').style.display = 'flex';
    let modifyArray = document.querySelectorAll('.profileData');

    for (let el of modifyArray) {
        originalData[el.id] = el.value;
        el.disabled = false;
        el.style.border = '1px solid black';
    }
}

//TODO ADMIN PROFILT CSAK SAJÁT MAGA TUDJA MÓDOSíTANI
async function confirmModificationProfile() {
    const emailRegExp = /^[A-Za-z0-9]+@[A-Za-z0-9]+\.[A-Za-z0-9]/;
    let isValid = true;
    let modifyArray = document.querySelectorAll('.profileData');
    let data = {};
    data.userId = document.getElementById('openedProfile').dataset.userId;

    for (const el of modifyArray) {
        data[el.id] = el.value;
    }

    if (originalData.profileUsername != data.profileUsername) {
        const isUsernameAvailable = await GetMethodFetch(
            '/api/isUsernameAvailable/' + data.profileUsername
        );
        if (!isUsernameAvailable.available || data.profileUsername.length > 50) {
            isValid = false;
            document.getElementById('profileUsername').style.border = '1px solid red';
        } else {
            document.getElementById('profileUsername').style.border = '1px solid black';
        }
    }

    if (data.profileEmail != originalData.profileEmail) {
        if (!emailRegExp.test(data.profileEmail) || data.profileEmail.length > 100) {
            isValid = false;
            document.getElementById('profileEmail').style.border = '1px solid red';
        } else {
            document.getElementById('profileEmail').style.border = '1px solid black';
        }
    }

    if (data.profileBiography != originalData.profileBiography) {
        if (data.profileBiography.length > 500) {
            isValid = false;
            document.getElementById('profileBiography').style.border = '1px solid red';
        } else {
            document.getElementById('profileBiography').style.border = '1px solid black';
        }
    }

    if (isValid) {
        const updateResponse = await PostMethodFetch('/api/updateProfileData', data);
        closeProfile();
    }
}

function closeProfile() {
    let modifyArray = document.querySelectorAll('.profileData');
    for (let el of modifyArray) {
        el.disabled = true;
        el.style.border = 'none';
    }
    document.getElementById('profActionModify').style.display = 'flex';
    document.getElementById('profActionConfirmModify').style.display = 'none';
    document.getElementById('openedProfile').style.display = 'none';
    document.getElementById('profilesTableDiv').style.display = 'block';
    document.getElementById('openedProfile').classList.remove('adminProfile');
    document.getElementById('openedProfile').classList.remove('reportedProfile');
    document.getElementById('openedProfile').removeAttribute('data-user-id');
    document.getElementById('profileBack').style.display = 'none';
    getProfiles();
}

function closeDeleteModal() {
    document.getElementById('deleteConfirmModal').style.display = 'none';
}

async function deleteProfile() {
    document.getElementById('deleteConfirmModal').style.display = 'flex';
    document.getElementById('deleteConfirm').dataset.deleteType = 'profile';
}

async function confirmDelete() {
    if (this.dataset.deleteType == 'profile') {
        const userId = document.getElementById('openedProfile').dataset.userId;
        const deleteResponse = await PostMethodFetch('/api/deleteProfile', { userId: userId });
        console.log(deleteResponse);
        closeDeleteModal();
        closeProfile();
    }
}

async function clearProfile() {
    const userId = document.getElementById('openedProfile').dataset.userId;
    const clearResponse = await PostMethodFetch('/api/clearProfile', { userId: userId });
    console.log(clearResponse);
    closeProfile();
}

async function openPost() {}

async function openComment() {}
