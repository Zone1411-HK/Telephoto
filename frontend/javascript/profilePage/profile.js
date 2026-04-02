const socket = io();
document.addEventListener('DOMContentLoaded', () => {
    startUp();
});

async function startUp() {
    try {
        if (await isLoggedIn()) {
            postsByUser(document.getElementById('postsByUser'));
            profileInfos();
            profileAddEventListeners();
            if (await isAdmin()) {
                let adminNav = document.createElement('a');
                adminNav.href = '/admin';
                adminNav.classList.add('navButton');
                adminNav.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg><span>Admin</span>`;

                document.getElementById('nav').appendChild(adminNav);
                /*
            let adminNavMobile = document.createElement('a');
            adminNavMobile.href = '/admin';
            adminNavMobile.classList.add('mobileIcon');
            adminNavMobile.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;

            document.getElementById('navMobile').appendChild(adminNavMobile);*/
            }
        } else {
            window.location.href = '/login';
        }
    } catch (error) {
        console.log(error);
    }
}

function profileAddEventListeners() {
    document.getElementById('postsByUser').addEventListener('click', postsByUser);
    document.getElementById('likedPosts').addEventListener('click', likedPosts);
    document.getElementById('dislikedPosts').addEventListener('click', dislikedPosts);
    document.getElementById('savedPosts').addEventListener('click', savedPosts);
    document.getElementById('previous').addEventListener('click', previousSlide);
    document.getElementById('next').addEventListener('click', nextSlide);
    document.getElementById('closePost').addEventListener('click', closePost);
    document.getElementById('profileModify').addEventListener('click', modifyProfile);
    document.getElementById('deleteCancel').addEventListener('click', hideDeleteModal);
    document.getElementById('deleteConfirm').addEventListener('click', doDelete);
    document.getElementById('logoutWrapper').addEventListener('click', logout);
}

async function logout() {
    const { Status } = await PostMethodFetch('/api/logout');
    if (Status == 'Success') {
        window.location.href = '/login';
    }
}

async function postsByUser() {
    const { Status, posts } = await GetMethodFetch('/api/postsByUser');
    if (Status == 'Success') {
        generatePosts(posts, true);
        try {
            makeTypeActive(this);
        } catch (error) {
            makeTypeActive(document.getElementById('postsByUser'));
        }
        console.log('Posztok sikeresen betöltve');
    }
}

async function likedPosts() {
    const { Status, posts } = await GetMethodFetch('/api/likedPosts');
    if (Status == 'Success') {
        generatePosts(posts, false);
        makeTypeActive(this);
        console.log('Posztok sikeresen betöltve');
    }
}

async function dislikedPosts() {
    const { Status, posts } = await GetMethodFetch('/api/dislikedPosts');
    if (Status == 'Success') {
        generatePosts(posts, false);
        makeTypeActive(this);
        console.log('Posztok sikeresen betöltve');
    }
}

async function savedPosts() {
    const { Status, posts } = await GetMethodFetch('/api/savedPosts');
    if (Status == 'Success') {
        generatePosts(posts, false);
        makeTypeActive(this);
        console.log('Posztok sikeresen betöltve');
    }
}

function generatePosts(posts, canDeletePost) {
    if (canDeletePost) {
        let postDeletionDiv = document.createElement('div');
        postDeletionDiv.classList.add('postDeletionDiv');
        postDeletionDiv.innerHTML = `
        <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="feather feather-trash-2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>`;
        postDeletionDiv.addEventListener('click', showDeleteModalPost);
        document.getElementById('postInfos').appendChild(postDeletionDiv);
    } else {
        const divs = document.querySelectorAll('.postDeletionDiv');
        if (divs.length != 0) {
            for (const div of divs) {
                div.remove();
            }
        }
    }

    let postArr = [];
    for (let i = 0; i < posts.length; i += 3) {
        let tempArr = [];
        let j = 0;
        while (j < 3 && j + i != posts.length) {
            tempArr.push(posts[i + j]);
            j++;
        }
        postArr.push(tempArr);
    }

    const postsDiv = document.getElementById('posts');
    postsDiv.replaceChildren();

    for (let arrayRow of postArr) {
        let row = document.createElement('div');
        row.classList.add('postRow');

        for (let arrayValue of arrayRow) {
            console.log(arrayValue);
            let post = document.createElement('div');
            let url = '../images/placeholder1.jpg';
            if (arrayValue.links.length != 0) {
                url = '/uploads/' + arrayValue.links[0];
            }

            let format = url.split('.')[1];
            let content;

            if (format == 'mp4' || format == 'avi' || format == 'hevc') {
                content = document.createElement('video');
                const source = document.createElement('source');
                source.src = url;
                source.type = `video/${format}`;
                content.appendChild(source);
                content.classList.add('postImg');
                content.controls = false;
            } else {
                content = document.createElement('img');
                content.src = url;
                content.alt = url;
                content.loading = 'lazy';
                content.classList.add('postImg');
                post.style.backgroundImage = "url(\'" + url + "\')";
            }

            post.classList.add('post');

            let postImgWrapper = document.createElement('div');
            postImgWrapper.classList.add('postImgWrapper');

            postImgWrapper.appendChild(content);
            post.appendChild(postImgWrapper);

            post.dataset.postId = arrayValue.post_id;
            post.addEventListener('click', openPost);

            row.appendChild(post);
        }

        postsDiv.appendChild(row);
    }
}

function makeTypeActive(element) {
    let activeElement = document.querySelector('.activeType');
    if (activeElement != undefined) {
        activeElement.classList.remove('activeType');
    }
    document.getElementById('postsDiv').style.animation = 'changePostSelection 1s forwards';
    setTimeout(() => {
        document.getElementById('postsDiv').style.animation = '';
    }, 1000);
    element.classList.add('activeType');
}

async function testing() {
    const response = await PostMethodFetch('/api/saveUsername', {
        username: 'testasd'
    });
}

async function profileInfos() {
    const { status, results } = await GetMethodFetch('/api/profileInfos');
    if (status == 'Success') {
        document.getElementById('profileName').innerText = results[0].username;
        document.getElementById('profileEmail').innerText = results[0].email;
        document.getElementById('profileRegistration').innerText =
            date_yyyy_MM_dd(results[0].registration_date) + ' óta';
        document.getElementById('profileBiography').innerText = results[0].biography;

        let profilePicture =
            results[0].profile_picture_link == null
                ? 'defaultProfile.jpg'
                : results[0].profile_picture_link;

        document.getElementById('profilePicture').src = '/profile_images/' + profilePicture;
        document.getElementById('profilePictureDiv').style.backgroundImage =
            `url("/profile_images/${profilePicture}")`;
        console.log('Profil adatok sikeresen betöltve');
    }
}

let openedPostId;

async function openPost() {
    openedPostId = this.dataset.postId;
    let modal = document.getElementById('openedPostModal');
    let post = document.getElementById('openedPost');

    modal.removeEventListener('click', closeModalByClickingOutside);
    modal.addEventListener('click', () => {
        closeModalByClickingOutside(event, modal, post);
    });

    modal.classList.remove('hidden');
    post.style.animation = 'fadeInUp 0.5s forwards';

    const { Status, Infos } = await GetMethodFetch('/api/postInfos/' + openedPostId);
    if (Status == 'Success') {
        console.log(Infos);
        generateSlideshow(Infos.pictureInfos);
        generatePostInfos(Infos.userInfos, Infos.postInfos);
        console.log('Kiválasztott poszt sikeresen betöltve');
    }
}

function generateSlideshow(contentArray) {
    let slideshowElement = document.getElementById('slideshow');
    let background = document.getElementById('postImages');
    slideshowElement.replaceChildren();

    for (let i = 0; i < contentArray.length; i++) {
        let content = contentArray[i];
        let format = content.split('.')[1];
        let media;

        if (format == 'mp4' || format == 'avi' || format == 'hevc') {
            media = document.createElement('video');
            media.muted = true;
            media.loop = true;
            media.controls = true;

            let source = document.createElement('source');
            source.src = '/uploads/' + content;
            source.type = 'video/' + format;
            media.appendChild(source);
            media.dataset.type = 'video';
            background.style.backgroundImage = 'url("/images/videoBackground.png")';
        } else {
            media = document.createElement('img');
            media.src = '/uploads/' + content;
            media.alt = '/uploads/' + content;
            media.dataset.type = 'image';
            console.log(content);
            background.style.backgroundImage = `url("/uploads/${content}")`;
        }

        media.classList.add('slideshowItem');

        if (i == 0) media.classList.add('activeSlideshowItem');

        slideshowElement.appendChild(media);
    }
}

function generatePostInfos(userInfos, postInfos) {
    document.getElementById('postUserPicture').src =
        'profile_images/' + userInfos.profile_picture_link;
    document.getElementById('postUsername').innerText = userInfos.username;
    document.getElementById('postTagsSpan').innerText = postInfos.tags;
    document.getElementById('postDescriptionSpan').innerText = postInfos.description;
    document.getElementById('postLocationSpan').innerText = postInfos.location;
    document.getElementById('postDateSpan').innerText = postInfos.creation_date;
}

function closePost() {
    let modal = document.getElementById('openedPostModal');

    let post = document.getElementById('openedPost');
    post.style.animation = 'fadeOutDown 0.5s forwards';

    setTimeout(() => {
        modal.classList.add('hidden');
        post.style.animation = '';
    }, 500);
}

function slideShow(move) {
    let slides = document.getElementsByClassName('slideshowItem');
    let j = 0;
    while (j < slides.length && slides[j].style.display == 'none') {
        j++;
    }

    let currentSlide = slides[j];
    currentSlide.style.display = 'none';

    if (currentSlide.dataset.type == 'video') {
        currentSlide.pause();
        currentSlide.currentTime = 0;
    }

    let finalIndex;

    if (j >= slides.length - 1 && move == 1) {
        finalIndex = 0;
    } else {
        if (j == 0 && move == -1) {
            finalIndex = slides.length - 1;
        } else {
            finalIndex = j + move;
        }
    }
    slides[finalIndex].style.display = 'block';
    if (slides[finalIndex].dataset.type == 'image') {
        document.getElementById('postImages').style.backgroundImage =
            `url(${slides[finalIndex].src})`;
    } else {
        document.getElementById('postImages').style.backgroundImage =
            `url("/images/videoBackground.png")`;
    }
}

let usernameBefore;
let profilePicBefore;
let biographyBefore;

function modifyProfile() {
    this.classList.add('hidden');
    document.getElementById('saveProfileModification').classList.remove('hidden');
    document
        .getElementById('saveProfileModification')
        .addEventListener('click', saveProfileChanges);

    document.getElementById('deleteProfile').classList.remove('hidden');
    document.getElementById('deleteProfile').addEventListener('click', showDeleteModalProfile);

    document.getElementById('cancelProfileModification').classList.remove('hidden');
    document
        .getElementById('cancelProfileModification')
        .addEventListener('click', cancelProfileChanges);

    let bio = document.getElementById('profileBiography');
    bio.parentNode.classList.add('modifyData');
    bio.disabled = false;
    biographyBefore = bio.value;

    let name = document.getElementById('profileName');
    name.contentEditable = true;
    name.classList.add('modifyData');
    usernameBefore = name.innerText;

    document.getElementById('profilePicture').classList.add('hidden');
    profilePicBefore = document.getElementById('profilePicture').src;

    let picture = document.getElementById('profilePictureUploadLabel');
    picture.classList.remove('hidden');
    console.log(usernameBefore + ' ' + profilePicBefore + ' ' + biographyBefore);
}

async function saveProfileChanges() {
    let isValid = true;

    let bio = document.getElementById('profileBiography');
    let responseBio =
        bio.value != biographyBefore
            ? await PostMethodFetch('/api/modifyProfileBiography', { biography: bio.value })
            : {
                  Status: 'failed'
              };

    let name = document.getElementById('profileName');
    let available = await GetMethodFetch('/api/isUsernameAvailable/' + name.innerText);
    if (available.available) {
        let responseName =
            name.innerText != usernameBefore
                ? await PostMethodFetch('/api/modifyProfileName', { username: name.innerText })
                : {
                      Status: 'failed'
                  };
    } else {
        name.innerText = usernameBefore;
    }

    let picture = document.getElementById('profilePictureUpload');
    let formdata = new FormData();
    formdata.append('profilePic', picture.files[0]);

    let responsePic =
        picture.files.length != 0
            ? await UploadPostMethod('/api/modifyProfilePicture', formdata)
            : { Status: 'failed' };

    let pictureEl = document.getElementById('profilePicture');
    if (responsePic.Status == 'success') {
        pictureEl.classList.remove('hidden');
        pictureEl.src = '/profile_images/' + responsePic.Link;
        document.getElementById('profilePictureDiv').style.backgroundImage =
            `url("/profile_images/${responsePic.Link}")`;
    }

    document.getElementById('profileModify').classList.remove('hidden');
    document.getElementById('cancelProfileModification').classList.add('hidden');
    document.getElementById('profilePictureUploadLabel').classList.add('hidden');
    document.getElementById('deleteProfile').classList.add('hidden');
    this.classList.add('hidden');

    pictureEl.classList.remove('hidden');

    name.classList.remove('modifyData');
    name.contentEditable = false;

    bio.disabled = true;
    bio.parentNode.classList.remove('modifyData');
}

function cancelProfileChanges() {
    document.getElementById('profileModify').classList.remove('hidden');
    document.getElementById('saveProfileModification').classList.add('hidden');
    document.getElementById('deleteProfile').classList.add('hidden');
    this.classList.add('hidden');

    document.getElementById('profilePictureUploadLabel').classList.add('hidden');
    let picture = document.getElementById('profilePicture');
    picture.classList.remove('hidden');
    picture.src = profilePicBefore;

    let name = document.getElementById('profileName');
    name.innerText = usernameBefore;
    name.classList.remove('modifyData');
    name.contentEditable = false;

    let bio = document.getElementById('profileBiography');
    bio.value = biographyBefore;
    bio.disabled = true;
    bio.parentNode.classList.remove('modifyData');

    this.removeEventListener('click', cancelProfileChanges);
}

async function UploadPostMethod(url, data) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: data
        });
        if (!response.ok) {
            throw new Error(`POST hiba: ${response.status} ( ${response.statusText} )`);
        }
        return await response.json();
    } catch (error) {
        throw new Error(`POST hiba: ${error.message}`);
    }
}

function showDeleteModal() {
    document.getElementById('deleteConfirmModal').style.display = 'flex';
    document.getElementById('deleteModalContent').style.animation = 'fadeInUp 1s forwards';
}

let deletionType;

function showDeleteModalPost() {
    deletionType = 'Post';
    showDeleteModal();
}

function showDeleteModalProfile() {
    deletionType = 'Profile';
    showDeleteModal();
}

function hideDeleteModal() {
    deletionType = '';
    document.getElementById('deleteModalContent').style.animation = 'fadeOutDown 0.5s forwards';
    setTimeout(() => {
        document.getElementById('deleteConfirmModal').style.display = 'none';
    }, 500);
}

async function doDelete() {
    console.log(deletionType);
    if (deletionType == 'Post') {
        try {
            const { Status } = await PostMethodFetch('/api/deletePost', { postId: openedPostId });
            if (Status == 'Success') {
                hideDeleteModal();
                closePost();
                postsByUser();
            } else {
                alert('Valami hiba történt!');
            }
        } catch (error) {
            console.error(error);
        }
    } else if (deletionType == 'Profile') {
        try {
            const { userId } = await GetMethodFetch('/api/sendUserId');
            const { Status } = await PostMethodFetch('/api/deleteProfile', { userId: userId });
            if (Status == 'Success') {
                await PostMethodFetch('/api/removeUserId');
                await PostMethodFetch('/api/removeUsername');
                window.location.href = '/login';
            } else {
                alert('Valami hiba történt!');
            }
        } catch (error) {
            console.error(error);
        }
    } else {
        alert('Valami hiba történt!');
    }
}
