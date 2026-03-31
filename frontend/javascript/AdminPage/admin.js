let socket = io();
let userTrackerArray = [];
let userTrackerTimeArray = [];
let map;
let matchMedia = window.matchMedia('(width > 768px)');

socket.emit('requestActiveUsers');
setInterval(() => {
    socket.emit('requestActiveUsers');
}, 1500);

document.addEventListener('DOMContentLoaded', () => {
    isAdmin();
    getProfiles();
    getPosts();
    getComments();
    adminAddEventListeners();
    loadAnimation();
});
window.addEventListener('resize', () => {
    let sidebar = document.getElementById('sidebar');

    if (!matchMedia.matches) {
        sidebar.dataset.collapsed = 'false';
        sidebar.classList.remove('collapsed');
        for (let i = 1; i < sidebar.children.length; i++) {
            sidebar.children[i].style.visibility = 'visible';
        }
    }
});

function collapseSidebar() {
    let sidebar = document.getElementById('sidebar');
    let adminContent = document.getElementById('adminContent');
    let isCollapsed = sidebar.dataset.collapsed;

    if (isCollapsed == 'true') {
        sidebar.dataset.collapsed = 'false';
        this.style.right = '-2.5vh';
        sidebar.classList.remove('collapsed');
        adminContent.style.width = '88vw';
    } else {
        sidebar.classList.add('collapsed');
        adminContent.style.width = '98vw';
        sidebar.dataset.collapsed = 'true';
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

//! COMMENT
//#region COMMENT

async function isAdmin() {
    let loggedIn = await isLoggedIn();
    if (!loggedIn) {
        window.location.href = '/';
    } else {
        const { Status } = await GetMethodFetch('/api/isAdmin');
        if (Status != 'success') {
            window.location.href = '/';
        }
    }
}

function adminAddEventListeners() {
    const navButtons = document.getElementsByClassName('altNavButton');
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

    document.getElementById('postBack').addEventListener('click', closePost);

    document.getElementById('profActionModify').addEventListener('click', modifyProfile);
    document
        .getElementById('profActionConfirmModify')
        .addEventListener('click', confirmModificationProfile);

    document.getElementById('profActionBan').addEventListener('click', deleteProfile);
    document.getElementById('postActionModify').addEventListener('click', modifyPost);
    document
        .getElementById('postActionConfirmModify')
        .addEventListener('click', confirmPostModification);
    document.getElementById('postActionBan').addEventListener('click', deletePost);

    document.getElementById('commentActionModify').addEventListener('click', modifyComment);
    document
        .getElementById('commentActionConfirmModify')
        .addEventListener('click', confirmCommentModification);

    document.getElementById('commentActionBan').addEventListener('click', deleteComment);

    document.getElementById('deleteCancel').addEventListener('click', closeDeleteModal);
    document.getElementById('deleteConfirm').addEventListener('click', confirmDelete);

    document.getElementById('slideshowLeft').addEventListener('click', previousSlide);
    document.getElementById('slideshowRight').addEventListener('click', nextSlide);
}

function loadAnimation() {
    let panels = document.querySelectorAll('.adminPanel');
    for (let i = 0; i < panels.length; i++) {
        setTimeout(() => {
            panels[i].style.animation = 'fadeInLeft 1s forwards';
            panels[i].style.display = 'block';
        }, i * 250);
    }
}

async function getComments() {
    try {
        const response = await GetMethodFetch('/api/getCommentsAdmin');
        if (response.Status == 'Success') {
            const result = response.Result;
            const tbody = document.getElementById('commentsTbody');
            tbody.replaceChildren();
            for (const obj of result) {
                const tr = document.createElement('tr');
                const values = Object.entries(obj);
                for (let i = 0; i < values.length - 1; i++) {
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
                }
                tr.addEventListener('click', openComment);
                if (values[5][1] == true) {
                    tr.classList.add('reported');
                    tr.dataset.reported = true;
                }
                tr.dataset.commentId = values[0][1];
                tbody.appendChild(tr);
            }
        }
    } catch (error) {
        console.error('Galiba támadt');
    }
}

async function openComment() {
    try {
        const commentId = this.dataset.commentId;
        const { Status, commentData } = await GetMethodFetch('/api/getCommentData/' + commentId);
        if (Status == 'Success') {
            document.getElementById('openedComment').style.display = 'flex';
            document.getElementById('openedComment').dataset.commentId = commentId;
            document.getElementById('commentsTableDiv').style.display = 'none';
            document.getElementById('commentUser').innerText =
                `Felhasználó: ${commentData.username} #${commentData.user_id}`;
            document.getElementById('commentPost').innerText = `Poszt: #${commentData.post_id}`;
            document.getElementById('commentDate').value = inputDate(commentData.comment_date);
            document.getElementById('commentContent').innerText = commentData.comment_content;

            if (this.dataset.reported == 'true') {
                document.getElementById('openedComment').classList.add('reported');
                document
                    .getElementById('commentActionClearH3')
                    .addEventListener('click', clearComment);
                document.getElementById('commentActionClearH3').classList.remove('disabledButton');
                document
                    .getElementById('commentActionClearH3')
                    .classList.add('adminActionClearEnabled');
            } else {
                document.getElementById('commentActionClearH3').classList.add('disabledButton');
                document
                    .getElementById('commentActionClearH3')
                    .removeEventListener('click', clearComment);
                document
                    .getElementById('commentActionClearH3')
                    .classList.remove('adminActionClearEnabled');
            }
        }
    } catch (error) {
        console.log(error);
    }
}

let originalComment = {};

async function modifyComment() {
    let modifiableDatas = document.querySelectorAll('.commentModifyData');
    for (const el of modifiableDatas) {
        originalComment[el.id] = el.value;
        el.disabled = false;
        el.style.backgroundColor = 'var(--PrimaryLight)';
        el.style.color = 'var(--SecondaryDark)';
    }
    console.log(originalComment);
    document.getElementById('commentActionConfirmModify').style.display = 'flex';
    this.style.display = 'none';
}

async function confirmCommentModification() {
    let modifiedArray = document.querySelectorAll('.commentModifyData');
    console.log(modifiedArray);
    let j = 0;
    while (
        j < modifiedArray.length &&
        modifiedArray[j].value == Object.values(originalComment)[j]
    ) {
        j++;
    }
    if (j < modifiedArray.length) {
        const modifyResponse = await PostMethodFetch('/api/updateCommentData', {
            commentId: document.getElementById('openedComment').dataset.commentId,
            commentDate: modifiedArray[0].value,
            commentContent: modifiedArray[1].value
        });
        if (modifyResponse.Status == 'Success') {
            closeComment();
        }
    }
}

async function clearComment() {
    const commentId = document.getElementById('openedComment').dataset.commentId;
    console.log(commentId);
    const clearResponse = await PostMethodFetch('/api/clearComment', { commentId: commentId });
    console.log(clearResponse);
    closeComment();
}

function closeComment() {
    try {
        let modifyArray = document.querySelectorAll('.commentModifyData');
        for (let el of modifyArray) {
            el.disabled = true;
            el.style.border = '1px solid rgb(192, 210, 220)';
            el.style.color = 'rgb(102, 110, 130)';
            el.value = '';
        }
        document.getElementById('commentActionModify').style.display = 'flex';
        document.getElementById('commentActionConfirmModify').style.display = 'none';
        document.getElementById('commentsTableDiv').style.display = 'block';
        document.getElementById('openedComment').style.display = 'none';
        document.getElementById('openedComment').classList.remove('reported');
        document.getElementById('openedComment').removeAttribute('data-comment-id');
        //document.getElementById('commentBack').style.display = 'none';
        getComments();
    } catch (error) {
        console.error(error);
    }
}

async function deleteComment() {
    document.getElementById('deleteConfirmModal').style.display = 'flex';
    document.getElementById('deleteConfirm').dataset.deleteType = 'comment';
}

//#endregion
//! PROFILE
//#region PROFILE

async function getProfiles() {
    try {
        const response = await GetMethodFetch('/api/getProfilesAdmin');
        if (response.Status == 'Success') {
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
                if (values[6][1]) {
                    tr.classList.add('adminProfile');
                    tr.dataset.admin = true;
                }

                if (values[7][1]) {
                    tr.classList.add('reported');
                    tr.dataset.reported = true;
                }

                tr.addEventListener('click', openProfile);
                tbody.appendChild(tr);
            }
        }
    } catch (error) {
        console.error(error);
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
            document.getElementById('openedProfile').classList.add('reported');
            document.getElementById('profActionClearH3').addEventListener('click', clearProfile);
            document.getElementById('profActionClearH3').classList.remove('disabledButton');
            document.getElementById('profActionClearH3').classList.add('adminActionClearEnabled');
        } else {
            document.getElementById('profActionClearH3').classList.add('disabledButton');
            document.getElementById('profActionClearH3').removeEventListener('click', clearProfile);
            document
                .getElementById('profActionClearH3')
                .classList.remove('adminActionClearEnabled');
        }

        const dateString = inputDate(ProfileData[0].registration_date);
        document.getElementById('profileUsername').value = ProfileData[0].username;
        document.getElementById('profileRegDate').value = `${dateString}`;
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
    document.getElementById('openedProfile').classList.remove('reported');
    document.getElementById('openedProfile').removeAttribute('data-user-id');
    document.getElementById('profileBack').style.display = 'none';
    getProfiles();
    getPosts();
    getComments();
}

async function deleteProfile() {
    document.getElementById('deleteConfirmModal').style.display = 'flex';
    document.getElementById('deleteConfirm').dataset.deleteType = 'profile';
}

async function clearProfile() {
    const userId = document.getElementById('openedProfile').dataset.userId;
    const clearResponse = await PostMethodFetch('/api/clearProfile', { userId: userId });
    console.log(clearResponse);
    closeProfile();
}

//#endregion

//! POST
//#region POST

async function getPosts() {
    try {
        const response = await GetMethodFetch('/api/getPostsAdmin');
        if (response.Status == 'Success') {
            const result = response.Result;
            const tbody = document.getElementById('postsTbody');
            tbody.replaceChildren();
            for (const obj of result) {
                const tr = document.createElement('tr');
                const values = Object.entries(obj);

                for (let i = 0; i < values.length - 1; i++) {
                    const td = document.createElement('td');
                    td.innerText = values[i][1];
                    if (values[i][0] == 'postId') {
                        tr.dataset.postId = values[i][1];
                    }

                    tr.appendChild(td);
                }
                if (values[6][1] == true) {
                    tr.classList.add('reported');
                    tr.dataset.reported = true;
                }

                tr.addEventListener('click', openPost);
                tbody.appendChild(tr);
            }
        }
    } catch (error) {
        console.error(error);
    }
}

async function openPost() {
    const postId = this.dataset.postId;
    const { Status, postData } = await GetMethodFetch('/api/getPostData/' + postId);
    if (Status == 'Success' && postData.length != 0) {
        document.getElementById('openedPost').style.display = 'flex';
        document.getElementById('openedPost').dataset.postId = postId;
        document.getElementById('postsTableDiv').style.display = 'none';
        document.getElementById('postBack').style.display = 'flex';

        if (this.dataset.reported == 'true') {
            document.getElementById('openedPost').classList.add('reported');
            document.getElementById('postActionClearH3').addEventListener('click', clearPost);
            document.getElementById('postActionClearH3').classList.remove('disabledButton');
            document.getElementById('postActionClearH3').classList.add('adminActionClearEnabled');
        } else {
            document.getElementById('postActionClearH3').classList.add('disabledButton');
            document.getElementById('postActionClearH3').removeEventListener('click', clearPost);
            document
                .getElementById('postActionClearH3')
                .classList.remove('adminActionClearEnabled');
        }

        generateMap(postData.latitude, postData.longitude);

        document.getElementById('postInputCreationDate').value = inputDate(postData.creationDate);
        document.getElementById('postUserNameId').innerText =
            `Felhasználó: ${postData.username} #${postData.userId}`;
        document.getElementById('postId').innerText = `Azonosító: #${postData.postId}`;

        let elArray = document.getElementsByClassName('postData');
        for (let i = 0; i < elArray.length; i++) {
            elArray[i].value = Object.values(postData)[i];
        }

        const slideshow = document.getElementById('slideshowContent');
        slideshow.replaceChildren();

        let pictures = Object.values(postData.pictureLinks);

        let pic = document.createElement('img');
        pic.src = '/uploads/' + pictures[0];
        pic.classList.add('pictures', 'active');
        slideshow.appendChild(pic);

        console.log(pictures);

        for (let i = 1; i < pictures.length; i++) {
            let p = document.createElement('img');
            p.src = '/uploads/' + pictures[i];
            p.classList.add('pictures');
            slideshow.appendChild(p);
        }

        //generateMap(10, 10);
    } else {
        alert('Valami probléma történt.\n\nKérjük próbálja meg később.');
    }
}

function closePost() {
    let modifyArray = document.querySelectorAll('.postModifyData');
    for (let el of modifyArray) {
        el.disabled = true;
        el.style.border = '1px solid rgb(192, 210, 220)';
    }
    document.getElementById('postActionModify').style.display = 'flex';
    document.getElementById('postActionConfirmModify').style.display = 'none';
    document.getElementById('postsTableDiv').style.display = 'block';
    document.getElementById('openedPost').style.display = 'none';
    document.getElementById('openedPost').classList.remove('reported');
    document.getElementById('openedPost').removeAttribute('data-post-id');
    document.getElementById('postBack').style.display = 'none';
    document
        .getElementById('postMap')
        .classList.remove(...document.getElementById('postMap').classList);
    map.remove();
    getPosts();
    getComments();
}

async function deletePost() {
    document.getElementById('deleteConfirmModal').style.display = 'flex';
    document.getElementById('deleteConfirm').dataset.deleteType = 'post';
}

async function clearPost() {
    const postId = document.getElementById('openedPost').dataset.postId;
    const clearResponse = await PostMethodFetch('/api/clearPost', { postId: postId });
    console.log(clearResponse);
    closePost();
}

let originalPost = {};

function modifyPost() {
    let modifiableDatas = document.querySelectorAll('.postModifyData');
    for (const el of modifiableDatas) {
        originalPost[el.id] = el.value;
        el.disabled = false;
    }
    console.log(originalPost);
    document.getElementById('postActionConfirmModify').style.display = 'flex';
    this.style.display = 'none';
    document.getElementById('postLongitude').addEventListener('input', placeMarker);
    document.getElementById('postLatitude').addEventListener('input', placeMarker);
}

let tempMarker;

function placeMarker() {
    let val = '';
    let dot = false;
    for (let i = 0; i < this.value.length; i++) {
        if (i == 0 && this.value[i] == '-') {
            val += this.value[i];
        }
        if (/[0-9]/.test(this.value[i])) {
            val += this.value[i];
        }
        if (!dot && this.value[i] == '.') {
            dot = true;
            if (i == 0 || (i == 1 && this.value[0] == '-')) {
                val += '0' + this.value[i];
            } else {
                val += this.value[i];
            }
        }
    }

    this.value = val;

    let latEl = document.getElementById('postLatitude');
    if (latEl.value > 90) {
        latEl.value = 90;
    } else {
        if (latEl.value < -90) {
            latEl.value = -90;
        }
    }

    let lonEl = document.getElementById('postLongitude');
    if (lonEl.value > 180) {
        lonEl.value = 180;
    } else {
        if (lonEl.value < -180) {
            lonEl.value = -180;
        }
    }

    let lat = latEl.value == '' || latEl.value == '-' ? null : parseFloat(latEl.value);
    let lon = lonEl.value == '' || lonEl.value == '-' ? null : parseFloat(lonEl.value);
    if (lat != null && lon != null) {
        console.log('asd');
        if (tempMarker != null) {
            map.removeLayer(tempMarker);
        }
        tempMarker = new L.Marker([lat, lon]);
        map.addLayer(tempMarker);
    }
}

async function confirmPostModification() {
    let modifiedArray = document.querySelectorAll('.postModifyData');
    console.log(modifiedArray);
    let j = 0;
    while (j < modifiedArray.length && modifiedArray[j].value == Object.values(originalPost)[j]) {
        j++;
    }
    if (j < modifiedArray.length) {
        const modifyResponse = await PostMethodFetch('/api/updatePostData', {
            postId: document.getElementById('openedPost').dataset.postId,
            postInputCreationDate: modifiedArray[0].value,
            postDescription: modifiedArray[1].value,
            postTags: modifiedArray[2].value,
            postLocationName: modifiedArray[3].value,
            postLatitude: modifiedArray[4].value,
            postLongitude: modifiedArray[5].value
        });
        if (modifyResponse.Status == 'Success') {
            closePost();
        }
    }
}

//#endregion

function closeDeleteModal() {
    document.getElementById('deleteConfirmModal').style.display = 'none';
    document.getElementById('deleteConfirm').dataset.deleteType = '';
}

async function confirmDelete() {
    if (this.dataset.deleteType == 'profile') {
        const userId = document.getElementById('openedProfile').dataset.userId;
        const deleteResponse = await PostMethodFetch('/api/deleteProfile', { userId: userId });
        console.log(deleteResponse);
        closeProfile();
    }
    if (this.dataset.deleteType == 'post') {
        const postId = document.getElementById('openedPost').dataset.postId;
        const deleteResponse = await PostMethodFetch('/api/deletePost', { postId: postId });
        console.log(deleteResponse);
        closePost();
    }
    if (this.dataset.deleteType == 'comment') {
        const commentId = document.getElementById('openedComment').dataset.commentId;
        const deleteResponse = await PostMethodFetch('/api/deleteComment', {
            commentId: commentId
        });
        console.log(deleteResponse);
        closeComment();
    }
    closeDeleteModal();
}

function slideShow(move) {
    let slides = document.getElementsByClassName('pictures');
    let j = 0;
    while (j < slides.length && !slides[j].classList.contains('active')) {
        j++;
    }
    slides[j].classList.remove('active');
    console.log();
    /*
    if (slides[j].children[1].classList.contains('tempVideo')) {
        slides[j].children[1].pause();
        slides[j].children[1].currentTime = 0;
    }*/
    console.log(j + ' ' + slides.length);
    if (j >= slides.length - 1 && move == 1) {
        slides[0].classList.add('active');
    } else {
        if (j == 0 && move == -1) {
            slides[slides.length - 1].classList.add('active');
        } else {
            slides[j + move].classList.add('active');
        }
    }
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

function generateMap(lat, lon) {
    let tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        noWrap: true
    });
    let zoom = 0;
    let center = [0, 0];
    if (lat != undefined && lon != undefined) {
        zoom = 9;
        center[0] = lat;
        center[1] = lon;
        document.getElementById('postMap').style.filter = 'none';
    } else {
        document.getElementById('postMap').style.filter = 'grayscale(100%)';
    }

    //console.log(
    //`zoom: ${zoom} | center: ${center} | draggable: ${draggable} | lat: ${lat} | lon: ${lon}`
    //);

    map = L.map('postMap', {
        zoomControl: false,
        layers: [tileLayer],
        zoom: zoom,
        center: center
    });
    map.invalidateSize();
}

function inputDate(originDate) {
    const date = new Date(originDate);
    const year = date.getUTCFullYear();
    let month = date.getUTCMonth() + 1;
    if (month.toString().length == 1) {
        month = '0' + month.toString();
    }

    let day = date.getUTCDate(date);
    if (day.toString().length == 1) {
        day = '0' + day.toString();
    }
    return `${year}-${month}-${day}`;
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

function navButtonClick() {
    const navButtons = document.getElementsByClassName('altNavButton');
    console.log(navButtons);
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
