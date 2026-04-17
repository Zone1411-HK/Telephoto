import * as utilFunctions from '../util.js';
import { GetMethodFetch, PostMethodFetch } from '../fetch.js';

const socket = io();

let currentURL = new URL(window.location.href);
let currentUser;

export async function startUp() {
    try {
        if (await utilFunctions.isLoggedIn()) {
            postsByUser(document.getElementById('postsByUser'));
            profileInfos();
            profileAddEventListeners();
            if (await utilFunctions.isAdmin()) {
                let adminNav = document.createElement('a');
                adminNav.href = '/admin';
                adminNav.classList.add('navButton');
                adminNav.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg><span>Admin</span>`;

                document.getElementById('nav').appendChild(adminNav);
            }

            let { Status, exists, Result } = await GetMethodFetch('/api/sendUsername');
            if (Status == 'Success' && exists) {
                currentUser = Result;
                let profileURL = new URL('/profile', 'http://127.0.0.1:3000/');
                profileURL.searchParams.set('username', currentUser);
                document.getElementById('profilGomb').href = profileURL;
                if (currentUser != currentURL.searchParams.get('username'))
                    document.getElementById('profileModifyDiv').classList.add('hidden');
            }
        } else {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error(error);
    }
}

export function loadNewUserImg() {
    let fr = new FileReader();
    fr.addEventListener('load', function (e) {
        document.getElementById('tempImg').src = e.target.result;
        document.getElementById('profilePictureDiv').style.backgroundImage =
            `url('${e.target.result}')`;
        document.getElementById('tempImg').classList.remove('hidden');
        document.getElementById('uploadSVG').classList.add('hidden');
    });
    fr.readAsDataURL(this.files[0]);
}

export function profileAddEventListeners() {
    document.getElementById('postsByUser').addEventListener('click', postsByUser);
    document.getElementById('likedPosts').addEventListener('click', likedPosts);
    document.getElementById('dislikedPosts').addEventListener('click', dislikedPosts);
    document.getElementById('savedPosts').addEventListener('click', savedPosts);
    document.getElementById('closePost').addEventListener('click', closePost);
    document.getElementById('profileModify').addEventListener('click', modifyProfile);
    document.getElementById('deleteCancel').addEventListener('click', hideDeleteModal);
    document.getElementById('deleteConfirm').addEventListener('click', doDelete);
    document.getElementById('logoutWrapper').addEventListener('click', utilFunctions.logout);
    document.getElementById('closeComments').addEventListener('click', utilFunctions.closeComments);
    document
        .getElementById('commentSvgWrapper')
        .addEventListener('click', utilFunctions.sendComment);
    document.getElementById('profilePictureUpload').addEventListener('change', loadNewUserImg);
}

export async function postsByUser() {
    let isTheUserSameAsProfile = currentUser == currentURL.searchParams.get('username');

    const { Status, posts } = await GetMethodFetch(
        '/api/postsByUser/' + currentURL.searchParams.get('username')
    );
    if (Status == 'Success') {
        generatePosts(posts, isTheUserSameAsProfile);
        try {
            makeTypeActive(this);
        } catch (error) {
            makeTypeActive(document.getElementById('postsByUser'));
        }
        console.log('Posztok sikeresen betöltve');
    }
}

export async function likedPosts() {
    const { Status, posts } = await GetMethodFetch(
        '/api/likedPosts/' + currentURL.searchParams.get('username')
    );
    if (Status == 'Success') {
        generatePosts(posts, false);
        makeTypeActive(this);
        console.log('Posztok sikeresen betöltve');
    }
}

export async function dislikedPosts() {
    const { Status, posts } = await GetMethodFetch(
        '/api/dislikedPosts/' + currentURL.searchParams.get('username')
    );
    if (Status == 'Success') {
        console.log(posts);
        generatePosts(posts, false);
        makeTypeActive(this);
        console.log('Posztok sikeresen betöltve');
    }
}

export async function savedPosts() {
    const { Status, posts } = await GetMethodFetch(
        '/api/savedPosts/' + currentURL.searchParams.get('username')
    );
    if (Status == 'Success') {
        generatePosts(posts, false);
        makeTypeActive(this);
        console.log('Posztok sikeresen betöltve');
    }
}

export function generatePostDelete() {
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

    return postDeletionDiv;
}

export function generatePosts(posts, canDeletePost) {
    if (canDeletePost) {
        //document.getElementById('postInfos').appendChild(generatePostDelete());
    } else {
        const divs = document.querySelectorAll('.postDeletionDiv');
        if (divs.length != 0) {
            for (const div of divs) {
                div.remove();
            }
        }
    }

    const postsDiv = document.getElementById('posts');
    postsDiv.replaceChildren();

    if (posts.length > 0) {
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

        for (let arrayRow of postArr) {
            let row = document.createElement('div');
            row.classList.add('postRow');

            for (let arrayValue of arrayRow) {
                console.log(arrayValue);
                let post = document.createElement('div');
                let url = '../images/placeholder1.jpg';

                if (arrayValue.links && arrayValue.links.length != 0) {
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

                post.classList.add('postPreview');

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
}

export function makeTypeActive(element) {
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

export async function testing() {
    const response = await PostMethodFetch('/api/saveUsername', {
        username: 'testasd'
    });
}

export async function profileInfos() {
    const response = await GetMethodFetch(
        '/api/profileInfos/' + currentURL.searchParams.get('username')
    );
    if (response.status == 'Success') {
        document.getElementById('profileName').innerText = response.results[0].username;
        document.getElementById('profileEmail').innerText = response.results[0].email;
        document.getElementById('profileRegistration').innerText =
            utilFunctions.date_yyyy_MM_dd(response.results[0].registration_date) + ' óta';
        document.getElementById('profileBiography').innerText = response.results[0].biography;

        let profilePicture =
            response.results[0].profile_picture_link == null
                ? 'defaultProfile.jpg'
                : response.results[0].profile_picture_link;

        document.getElementById('profilePicture').src = '/profile_images/' + profilePicture;
        document.getElementById('profilePictureDiv').style.backgroundImage =
            `url("/profile_images/${profilePicture}")`;
        console.log('Profil adatok sikeresen betöltve');
    } else {
        const disclaimer = document.createElement('p');
        disclaimer.innerText = 'Nincsen ilyen profil!';
        disclaimer.classList.add('disclaimer');
        document.getElementById('root').replaceChildren();
        document.getElementById('root').appendChild(disclaimer);
    }
}

let openedPostId;

export async function openPost() {
    openedPostId = this.dataset.postId;
    console.log(openedPostId);

    let { Status, Infos } = await GetMethodFetch('/api/postInfos/' + openedPostId);

    if (Status == 'Success') {
        console.log(Infos);
        let modal = document.getElementById('openedPostModal');
        let content = document.getElementById('openedPost');
        content.replaceChildren();
        content.style.animation = 'fadeInUp 0.5s forwards';
        modal.removeEventListener('click', utilFunctions.closeModalByClickingOutside);
        modal.classList.remove('hidden');
        modal.addEventListener('click', function (event) {
            utilFunctions.closeModalByClickingOutside(event, modal, post);
        });

        let post = document.createElement('div');
        post.classList.add('post');

        let slideshow = utilFunctions.generateSlideshow(Infos.links);

        let timestamp = utilFunctions.generateTimestamp(Infos.creation_date);
        slideshow.appendChild(timestamp);

        let tags = utilFunctions.generateTags(Infos.tags, Infos.location);

        let description = utilFunctions.generateDescription(Infos.description);

        let interactionRow = await utilFunctions.generateInteractions(
            Infos.interactions[0].like,
            Infos.interactions[0].dislike,
            Infos.interactions[0].favorite,
            Infos.post_id,
            Infos.upvote,
            Infos.downvote
        );

        let userRow = utilFunctions.generateUserRow(Infos.username, Infos.profile_picture_link);

        let postcontent = document.createElement('div');
        postcontent.classList.add('postContent');

        postcontent.appendChild(slideshow);

        postcontent.appendChild(interactionRow);
        postcontent.appendChild(userRow);
        postcontent.appendChild(tags);
        postcontent.appendChild(description);

        let selectionType = document.querySelector('.activeType');
        if (
            currentURL.searchParams.get('username') == currentUser &&
            selectionType.id == 'postsByUser'
        ) {
            let deleteButton = generatePostDelete();
            postcontent.appendChild(deleteButton);
        }

        post.appendChild(postcontent);
        post.dataset.postId = Infos.post_id;

        content.appendChild(post);
        modal.removeEventListener('click', utilFunctions.closeModalByClickingOutside);
        modal.addEventListener('click', () => {
            utilFunctions.closeModalByClickingOutside(event, modal, post);
        });

        modal.classList.remove('hidden');
        post.style.animation = 'fadeInUp 0.5s forwards';
    }
}

export function closePost() {
    let modal = document.getElementById('openedPostModal');

    let post = document.getElementById('openedPost');
    post.style.animation = 'fadeOutDown 0.5s forwards';

    setTimeout(() => {
        modal.classList.add('hidden');
        post.style.animation = '';
    }, 500);
}

let usernameBefore;
let profilePicBefore;
let biographyBefore;

export function modifyProfile() {
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
    document.getElementById('uploadSVG').classList.remove('hidden');

    profilePicBefore = document.getElementById('profilePicture').src;

    let picture = document.getElementById('profilePictureUploadLabel');
    picture.classList.remove('hidden');
    console.log(usernameBefore + ' ' + profilePicBefore + ' ' + biographyBefore);
}

export function isImageFormat(file) {
    if (!file) return false;
    let format = file.name.split('.')[1];
    if (
        format == 'jpg' ||
        format == 'jpeg' ||
        format == 'png' ||
        format == 'jfif' ||
        format == 'png' ||
        format == 'gif' ||
        format == 'webp'
    ) {
        return true;
    }
    return false;
}
export async function saveProfileChanges() {
    let formdata = new FormData();

    let bio = document.getElementById('profileBiography');
    let name = document.getElementById('profileName');
    let pictureEl = document.getElementById('profilePicture');
    let picture = document.getElementById('profilePictureUpload');

    let available = await GetMethodFetch('/api/isUsernameAvailable/' + name.textContent);

    formdata.append('targetUser', currentURL.searchParams.get('username'));
    formdata.append('username', name.textContent);
    formdata.append('biography', bio.value);

    let file = picture.files[0];
    let uploadFile = file
        ? new File(
              [file],
              file.name
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')

                  //? keres egy pontot (\.) ha utána van még pont (?=.*\.) (asszem)
                  .replace(/\.(?=.*\.)/g, '-'),
              {
                  type: file.type
              }
          )
        : undefined;
    formdata.append('profilePic', isImageFormat(uploadFile) ? uploadFile : undefined);
    console.log();
    formdata.append('currentProfilePicture', pictureEl.src.split('/profile_images/')[1]);
    if (available.available || name.innerText == usernameBefore) {
        let { Status } = await UploadPostMethod('/api/modifyProfile', formdata);
        if (Status == 'success') {
            currentURL.searchParams.set('username', name.textContent);
            window.location.href = currentURL;
        } else {
            console.log(Status);
        }
    }

    document.getElementById('profileModify').classList.remove('hidden');
    document.getElementById('cancelProfileModification').classList.add('hidden');
    document.getElementById('profilePictureUploadLabel').classList.add('hidden');
    document.getElementById('deleteProfile').classList.add('hidden');
    document.getElementById('tempImg').src = '';
    document.getElementById('tempImg').classList.add('hidden');
    this.classList.add('hidden');

    pictureEl.classList.remove('hidden');

    name.classList.remove('modifyData');
    name.contentEditable = false;

    bio.disabled = true;
    bio.parentNode.classList.remove('modifyData');
}

export function cancelProfileChanges() {
    document.getElementById('profileModify').classList.remove('hidden');
    document.getElementById('saveProfileModification').classList.add('hidden');
    document.getElementById('deleteProfile').classList.add('hidden');
    this.classList.add('hidden');

    document.getElementById('profilePictureUploadLabel').classList.add('hidden');
    document.getElementById('tempImg').src = '';
    document.getElementById('tempImg').classList.add('hidden');
    document.getElementById('profilePictureDiv').style.backgroundImage =
        `url('${profilePicBefore}')`;

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

export async function UploadPostMethod(url, data) {
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

export function showDeleteModal() {
    document.getElementById('deleteConfirmModal').style.display = 'flex';
    document.getElementById('deleteModalContent').style.animation = 'fadeInUp 1s forwards';
}

let deletionType;

export function showDeleteModalPost() {
    deletionType = 'Post';
    showDeleteModal();
}

export function showDeleteModalProfile() {
    deletionType = 'Profile';
    showDeleteModal();
}

export function hideDeleteModal() {
    deletionType = '';
    document.getElementById('deleteModalContent').style.animation = 'fadeOutDown 0.5s forwards';
    setTimeout(() => {
        document.getElementById('deleteConfirmModal').style.display = 'none';
    }, 500);
}

export async function doDelete() {
    console.log(deletionType);
    if (currentUser == currentURL.searchParams.get('username')) {
        if (deletionType == 'Post') {
            try {
                console.log(openedPostId);
                const { Status } = await PostMethodFetch('/api/deletePostOwn', {
                    postId: openedPostId
                });
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
                const { Status } = await PostMethodFetch('/api/deleteProfileOwn', {
                    userId: userId
                });
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
    } else {
        alert('Önnek nincsen ehhez jogusultsága!');
        hideDeleteModal();
    }
}
