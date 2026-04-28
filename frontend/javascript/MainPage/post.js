import * as utilFunctions from '../util.js';
import { GetMethodFetch, PostMethodFetch } from '../fetch.js';

let type = 'top';
let timeframe = 36500;

export function addEventListenersToElements() {
    const trendingButtons = document.querySelectorAll('.trendingButton');
    for (const button of trendingButtons) {
        button.addEventListener('click', trendingPosts);
    }

    document.getElementById('postSearchSVGWrapper').addEventListener('click', function () {
        searchPost('postSearch', this);
    });
    document.getElementById('postSearchSVGWrapperMobile').addEventListener('click', function () {
        searchPost('postSearchMobile', this);
    });
    document.getElementById('closeComments').addEventListener('click', utilFunctions.closeComments);
    document
        .getElementById('commentSvgWrapper')
        .addEventListener('click', utilFunctions.sendComment);
    document.getElementById('commentTextarea').addEventListener('keypress', function (e) {
        if (e.key == 'Enter') {
            e.preventDefault();
            utilFunctions.sendComment();
        }
    });
    document.getElementById('openSort').addEventListener('click', toggleSort);
}

export function toggleSort() {
    if (this.dataset.opened == 'false') {
        openSort();
        this.dataset.opened = 'true';
    } else {
        closeSort();
        this.dataset.opened = 'false';
    }
}

export function openSort() {
    let sortDiv = document.getElementById('mobileSort');
    sortDiv.classList.remove('hidden');
    sortDiv.style.animation = 'fadeInUp 0.5s forwards';
    setTimeout(() => {
        sortDiv.style.animation = '';
    }, 500);
}

export function closeSort() {
    let sortDiv = document.getElementById('mobileSort');
    sortDiv.style.animation = 'fadeOutDown 0.5s forwards';
    setTimeout(() => {
        sortDiv.style.animation = '';
        sortDiv.classList.add('hidden');
    }, 500);
}

export function removeActiveLoad() {
    const postLoads = document.querySelectorAll('.activeSort');
    for (const button of postLoads) {
        button.classList.remove('activeSort');
    }
}

let searchValue;

export async function getSearchedPosts(searchValue) {
    const response = await GetMethodFetch('/api/searchPosts/' + searchValue);

    if (response.status != 'failed') {
        const data = response.results;

        for (let i = 0; i < data.length; i++) {
            await hangPictures(data[i]);
        }
        type = 'searched';
        const { status, result } = await PostMethodFetch('/api/setOffset', {
            type: type,
            offset: 50
        });
        appendLoadMore(data.length == 50);
    } else {
        appendLoadMore(false);
    }
}

export async function searchPost(searchDiv, searchButton) {
    try {
        searchValue = document.getElementById(searchDiv).value;
        if (searchValue.length >= 2) {
            const setOffsetResponse = await PostMethodFetch('/api/setOffset', {
                type: 'reset',
                offset: 0
            });

            let posts = document.getElementById('posts-container');
            posts.replaceChildren();
            removeActiveLoad();
            searchButton.parentNode.classList.add('activeSort');
            searchButton.classList.add('activeSort');
            searchButton.parentNode.children[0].classList.add('activeSort');

            await getSearchedPosts(searchValue);
        }
    } catch (error) {
        console.error('Hiba' + error);
    }
}

export async function trendingPosts() {
    removeActiveLoad();
    const trendingButtons = document.querySelectorAll('.trendingButton');
    for (const button of trendingButtons) {
        button.removeEventListener('click', trendingPosts);
    }
    this.classList.add('activeSort');

    let posts = document.getElementById('posts-container');
    posts.replaceChildren();
    const { status, result } = await PostMethodFetch('/api/setOffset', {
        type: 'reset',
        offset: 0
    });
    timeframe = this.children[1].value;
    getTopPosts().then(() => {
        for (const button of trendingButtons) {
            button.addEventListener('click', trendingPosts);
        }
    });
}

export async function startUpPosts() {
    const { status, result } = await PostMethodFetch('/api/setOffset', {
        type: 'reset',
        offset: 0
    });
    await getTopPosts();
    addEventListenersToElements();
    const trendingButtons = document.querySelectorAll('.trendingButton');
    trendingButtons[trendingButtons.length - 1].classList.add('activeSort');
}

const getTopPosts = async () => {
    try {
        type = 'top';
        const response = await GetMethodFetch('/api/topPosts/' + timeframe);

        if (response.status != 'failed') {
            const data = response.results;

            for (let i = 0; i < data.length; i++) {
                await hangPictures(data[i]);
            }
            const { status, result } = await PostMethodFetch('/api/setOffset', {
                type: type,
                offset: 50
            });
            appendLoadMore(data.length == 50);
        } else {
            appendLoadMore(false);
        }
    } catch (error) {
        console.error('Hiba' + error);
    }
};

export async function randomPlaceSort(searchValue) {
    type = searchValue;

    const response = await GetMethodFetch('/api/randomPlacesPosts/' + searchValue);

    if (response.status != 'failed') {
        const data = response.places;

        for (let i = 0; i < data.length; i++) {
            await hangPictures(data[i]);
        }

        const { status, result } = await PostMethodFetch('/api/setOffset', {
            type: type,
            offset: 50
        });

        appendLoadMore(data.length == 50);
    } else {
        appendLoadMore(false);
    }
}

export function appendLoadMore(areThereMorePosts) {
    const loadMore = document.createElement('div');
    loadMore.classList.add('loadMorePost');
    if (areThereMorePosts) {
        loadMore.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
        loadMore.addEventListener('click', loadMorePost);
    } else {
        loadMore.innerText = 'Úgy néz ki, a végére értél';
    }
    document.getElementById('posts-container').appendChild(loadMore);
}

export async function loadMorePost() {
    if (type == 'top') {
        getTopPosts(timeframe);
    } else if (type == 'searched') {
        getSearchedPosts(searchValue);
    } else {
        randomPlaceSort(type);
    }
    this.remove();
}

export function generateRope() {
    let ropediv = document.createElement('div');
    let rope = document.createElement('hr');
    let ropetexture = document.createElement('hr');
    ropediv.classList.add('ropeDiv');
    rope.classList.add('rope');
    ropetexture.classList.add('ropeTexture');

    ropediv.appendChild(rope);
    ropediv.appendChild(ropetexture);

    return ropediv;
}

export function generateClip() {
    let clip = document.createElement('div');
    let imgclip = document.createElement('div');
    let imgcliptexture = document.createElement('div');
    clip.classList.add('clip');
    imgclip.classList.add('imgClip');
    imgcliptexture.classList.add('imgClipTexture');

    clip.appendChild(imgclip);
    clip.appendChild(imgcliptexture);

    return clip;
}

const hangPictures = async (test) => {
    let posts = document.getElementById('posts-container');
    let post = document.createElement('div');
    post.classList.add('post');

    let ropediv = generateRope();
    let clip = generateClip();
    let slideshow = utilFunctions.generateSlideshow('/uploads/', test.links);

    let timestamp = utilFunctions.generateTimestamp(test.creation_date);
    slideshow.appendChild(timestamp);

    let tags = utilFunctions.generateTags(test.tags, test.location);

    let description = utilFunctions.generateDescription(test.description);

    console.log(test.post_id);
    console.log(test);

    let interactionRow = await utilFunctions.generateInteractions(
        test.interactions[0].like,
        test.interactions[0].dislike,
        test.interactions[0].favorite,
        test.post_id,
        test.upvote,
        test.downvote
    );

    let userRow = utilFunctions.generateUserRow(test.username, test.profile_picture_link);

    let postcontent = document.createElement('div');
    postcontent.classList.add('postContent');

    postcontent.appendChild(slideshow);

    postcontent.appendChild(interactionRow);
    postcontent.appendChild(userRow);
    postcontent.appendChild(tags);
    postcontent.appendChild(description);

    post.appendChild(ropediv);
    post.appendChild(clip);
    post.appendChild(postcontent);
    post.dataset.postId = test.post_id;

    const options = {
        root: posts,
        threshold: 0
    };

    const callback = (entries) => {
        let matchMedia = window.matchMedia('(width > 1000px)');

        entries.forEach((element) => {
            if (element.isIntersecting) {
                let postContent = element.target.children[2];
                if (matchMedia.matches) {
                    postContent.style.animation = 'fadeInUp 0.5s forwards';
                } else {
                    postContent.style.animation = 'fadeInLeft 0.5s forwards';
                }
            }
        });
    };
    const observer = new IntersectionObserver(callback, options);

    observer.observe(post);

    posts.appendChild(post);
};
