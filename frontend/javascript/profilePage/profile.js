const socket = io();
document.addEventListener('DOMContentLoaded', () => {
    testing();
    loadProfile();
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
