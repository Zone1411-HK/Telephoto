const socket = io();
document.addEventListener('DOMContentLoaded', () => {
    testing();
    postsByUser(document.getElementById('postsByUser'));
    profileInfos();
    /*
    let posts = document.querySelectorAll('.post');

    for (let post of posts) {
        let src = post.children[0].children[0].src;
        src = '../' + src.split('3000/')[1];
        let url = "url(\'" + src + "')";
        console.log(url);
        post.style.backgroundImage = url;
    }*/
    document.getElementById('postsByUser').addEventListener('click', postsByUser);
    document.getElementById('likedPosts').addEventListener('click', likedPosts);
    document.getElementById('dislikedPosts').addEventListener('click', dislikedPosts);
    document.getElementById('savedPosts').addEventListener('click', savedPosts);
    document.getElementById('previous').addEventListener('click', previousSlide);
    document.getElementById('next').addEventListener('click', nextSlide);
    document.getElementById('closePost').addEventListener('click', closePost);
});

async function postsByUser() {
    const { Status, posts } = await GetMethodFetch('/api/postsByUser');
    if (Status == 'Success') {
        generatePosts(posts);
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
        generatePosts(posts);
        makeTypeActive(this);
        console.log('Posztok sikeresen betöltve');
    }
}
async function dislikedPosts() {
    const { Status, posts } = await GetMethodFetch('/api/dislikedPosts');
    if (Status == 'Success') {
        generatePosts(posts);
        makeTypeActive(this);
        console.log('Posztok sikeresen betöltve');
    }
}
async function savedPosts() {
    const { Status, posts } = await GetMethodFetch('/api/savedPosts');
    if (Status == 'Success') {
        generatePosts(posts);
        makeTypeActive(this);
        console.log('Posztok sikeresen betöltve');
    }
}

function generatePosts(posts) {
    const len = posts.length;
    let finalRow;
    if (len % 3 == 0) {
        finalRow = 3;
    } else if (len % 3 == 2) {
        finalRow = 2;
    } else {
        finalRow = 1;
    }
    const postsDiv = document.getElementById('posts');
    postsDiv.replaceChildren();

    for (let i = 0; i < len / 3; i++) {
        let row = document.createElement('div');
        row.classList.add('postRow');
        for (let j = i * 3; j < i * 3 + finalRow; j++) {
            let post = document.createElement('div');
            let url = '../images/placeholder1.jpg';
            if (posts[j].pictures.length != 0) {
                url = '/uploads/' + posts[j].pictures[0].picture_link;
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

            post.dataset.postId = posts[j].post_id;
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
    document.getElementById('posts').style.animation = 'changePostSelection 1s forwards';
    setTimeout(() => {
        document.getElementById('posts').style.animation = '';
    }, 1000);
    element.classList.add('activeType');
}

async function testing() {
    const response = await PostMethodFetch('/api/saveUsername', {
        username: 'test'
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
                ? '/profile_images/defaultPicture.svg'
                : results[0].profile_picture_link;
        document.getElementById('profilePicture').src = '/profile_images/' + profilePicture;
        document.getElementById('profilePictureDiv').style.backgroundImage =
            `url(/profile_images/${profilePicture})`;
        console.log('Profil adatok sikeresen betöltve');
    }
}

async function openPost() {
    let postId = this.dataset.postId;
    let modal = document.getElementById('openedPostModal');
    let post = document.getElementById('openedPost');

    modal.removeEventListener('click', closeModal);
    modal.addEventListener('click', closeModal);

    modal.style.display = 'flex';
    post.style.animation = 'fadeInVertical 0.5s forwards';

    const { Status, Infos } = await GetMethodFetch('/api/postInfos/' + postId);
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

function closeModal(e) {
    let modal = document.getElementById('openedPostModal');
    let clickedOutside = e.target == modal;

    if (clickedOutside) {
        let post = document.getElementById('openedPost');
        post.style.animation = 'fadeOutVertical 0.5s forwards';

        setTimeout(() => {
            modal.style.display = 'none';
        }, 500);
    }
}

function closePost() {
    let modal = document.getElementById('openedPostModal');

    let post = document.getElementById('openedPost');
    post.style.animation = 'fadeOutVertical 0.5s forwards';

    setTimeout(() => {
        modal.style.display = 'none';
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
