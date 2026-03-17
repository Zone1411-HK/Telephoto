const socket = io();
document.addEventListener('DOMContentLoaded', () => {
    testing();
    loadProfile();
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
});

async function loadProfile() {
    let el = document.getElementById('postsByUser');
    postsByUser(el);
}

async function postsByUser() {
    const { Status, posts } = await GetMethodFetch('/api/postsByUser');
    if (Status == 'Success') {
        generatePosts(posts);
        try {
            makeTypeActive(this);
        } catch (error) {
            makeTypeActive(document.getElementById('postsByUser'));
        }
    }
}
async function likedPosts() {
    const { Status, posts } = await GetMethodFetch('/api/likedPosts');
    if (Status == 'Success') {
        generatePosts(posts);
        makeTypeActive(this);
    }
}
async function dislikedPosts() {
    const { Status, posts } = await GetMethodFetch('/api/dislikedPosts');
    if (Status == 'Success') {
        generatePosts(posts);
        makeTypeActive(this);
    }
}
async function savedPosts() {
    const { Status, posts } = await GetMethodFetch('/api/savedPosts');
    if (Status == 'Success') {
        generatePosts(posts);
        makeTypeActive(this);
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
            post.classList.add('post');
            post.style.backgroundImage = "url(\'" + url + "\')";

            let postImgWrapper = document.createElement('div');
            postImgWrapper.classList.add('postImgWrapper');

            let img = document.createElement('img');
            img.src = url;
            img.alt = url;
            img.loading = 'lazy';
            img.classList.add('postImg');

            postImgWrapper.appendChild(img);
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
    }
}

async function openPost() {}

function slideShow(move) {
    let slides = document.getElementsByClassName('slideshowItem');
    let j = 0;
    while (j < slides.length && slides[j].style.display == 'none') {
        j++;
    }
    slides[j].style.display = 'none';
    console.log();
    try {
        if (slides[j].children[1].classList.contains('tempVideo')) {
            slides[j].children[1].pause();
            slides[j].children[1].currentTime = 0;
        }
    } catch (error) {}
    console.log(j + ' ' + slides.length);
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
    document.getElementById('postImages').style.backgroundImage = `url(${slides[finalIndex].src})`;
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
