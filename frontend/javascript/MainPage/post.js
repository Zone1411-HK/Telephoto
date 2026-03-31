let type = 'top';
let timeframe = 36500;

document.addEventListener('DOMContentLoaded', () => {
    startUp();
    //testFunction();

    document.getElementById('closeComments').addEventListener('click', closeComments);
    document.getElementById('commentSvgWrapper').addEventListener('click', sendComment);
});

async function testFunction(username) {
    const response = await PostMethodFetch('/api/saveUsername', {
        username: username
    });
}

/*
function base(data, i) {
    let object = {
        username: data[i].username,
        userPic: data[i].profile_picture_link,
        pic: data[i].picture_link,
        post_id: data[i].post_id,
        description: data[i].description,
        tags: data[i].tags,
        location: data[i].location,
        latitude: data[i].latitude,
        longitude: data[i].longitude,
        creation_date: data[i].creation_date
    };

    return object;
}*/

function addEventListenersToElements() {
    const trendingButtons = document.querySelectorAll('.trendingButton');
    for (const button of trendingButtons) {
        button.addEventListener('click', trendingPosts);
    }

    document.getElementById('postSearchSVGWrapper').addEventListener('click', searchPost);
}

function removeActiveLoad() {
    const postLoads = document.querySelectorAll('.activeSort');
    for (const button of postLoads) {
        console.log(button);
        button.classList.remove('activeSort');
    }
}

let searchValue;

async function getSearchedPosts(searchValue) {
    type = 'search';
    const response = await GetMethodFetch('/api/searchPosts/' + searchValue);
    console.log(response);

    if (response.status != 'failed') {
        const data = response.results;
        console.log(data);

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

async function searchPost() {
    try {
        searchValue = document.getElementById('postSearch').value;
        if (searchValue.length >= 2) {
            const setOffsetResponse = await PostMethodFetch('/api/setOffset', {
                type: 'reset',
                offset: 0
            });
            console.log(setOffsetResponse);

            let posts = document.getElementById('posts-container');
            posts.replaceChildren();
            removeActiveLoad();
            this.parentNode.classList.add('activeSort');
            this.classList.add('activeSort');
            this.parentNode.children[0].classList.add('activeSort');

            await getSearchedPosts(searchValue);
        }
    } catch (error) {
        console.error('Hiba' + error);
    }
}

async function trendingPosts() {
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

async function startUp() {
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
        console.log(response);

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

function appendLoadMore(areThereMorePosts) {
    const loadMore = document.createElement('div');
    loadMore.classList.add('loadMorePost');
    if (areThereMorePosts) {
        loadMore.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
        loadMore.addEventListener('click', loadMorePost);
    } else {
        loadMore.innerText = 'Úgy néz ki a végére értél';
    }
    document.getElementById('posts-container').appendChild(loadMore);
}

async function loadMorePost() {
    if (type == 'top') {
        getTopPosts(timeframe);
    }
    if (type == 'search') {
        getSearchedPosts(searchValue);
    }
    this.remove();
}

function generateRope() {
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

function generateClip() {
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

function slideshowController(move, slideshow) {
    let slides = slideshow.children;
    let j = 0;
    while (j < slides.length && slides[j].classList.contains('hidden')) {
        j++;
    }

    let currentSlide = slides[j];
    currentSlide.classList.add('hidden');

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
    slides[finalIndex].classList.remove('hidden');

    let postImages = slideshow.parentNode.parentNode;
    if (slides[finalIndex].dataset.type == 'image') {
        postImages.style.backgroundImage = `url(${slides[finalIndex].src})`;
    } else {
        postImages.style.backgroundImage = `url("/images/videoBackground.png")`;
    }
}

function nextSlideItem() {
    this.style.pointerEvents = 'none';
    setTimeout(() => {
        this.style.pointerEvents = 'all';
    }, 1);
    let slideshow = this.parentNode.children[1];
    slideshowController(1, slideshow);
}

function previousSlideItem() {
    this.style.pointerEvents = 'none';
    setTimeout(() => {
        this.style.pointerEvents = 'all';
    }, 1);
    let slideshow = this.parentNode.children[1];
    slideshowController(-1, slideshow);
}

function generateSlideshow(links) {
    if (links == undefined) return document.createElement('div');
    let postImages = document.createElement('div');
    postImages.classList.add('postImages');

    let backdropWrapper = document.createElement('div');
    backdropWrapper.classList.add('backdropWrapper');

    let previous = document.createElement('div');
    previous.classList.add('previous');
    previous.innerText = '<';
    previous.addEventListener('click', previousSlideItem);

    let next = document.createElement('div');
    next.classList.add('next');
    next.innerText = '>';
    next.addEventListener('click', nextSlideItem);

    let slideshow = document.createElement('div');
    slideshow.classList.add('slideshow');

    for (let i = 0; i < links.length; i++) {
        let content = links[i];
        let format = content.split('.')[1];
        let media;
        console.log(format);
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
            if (i == 0) postImages.style.backgroundImage = 'url("/images/videoBackground.png")';
        } else {
            media = document.createElement('img');
            media.src = '/uploads/' + content;
            media.alt = '/uploads/' + content;
            media.dataset.type = 'image';

            if (i == 0) postImages.style.backgroundImage = `url("/uploads/${content}")`;
        }

        media.classList.add('slideshowItem');

        if (i != 0) media.classList.add('hidden');

        slideshow.appendChild(media);
    }

    backdropWrapper.appendChild(previous);
    backdropWrapper.appendChild(slideshow);
    backdropWrapper.appendChild(next);

    postImages.appendChild(backdropWrapper);

    return postImages;
}

function generateTimestamp(rawDate) {
    const date = date_yyyy_MM_dd(rawDate);
    let element = document.createElement('div');
    element.classList.add('postTimestamp');
    element.innerText = date;
    return element;
}

function generateTags(tags) {
    let wrapper = document.createElement('div');
    wrapper.classList.add('postTagWrapper');

    if (tags) {
        let tagArray = tags.split('#');
        for (let i = 1; i < tagArray.length; i++) {
            let tag = document.createElement('span');
            tag.innerText = '#' + tagArray[i];
            tag.classList.add('postTag');
            wrapper.appendChild(tag);
        }
    }

    return wrapper;
}

function generateDescription(description) {
    let descriptionElement = document.createElement('div');
    descriptionElement.classList.add('postDescription');
    descriptionElement.innerText = description;

    return descriptionElement;
}

async function generateInteractions(
    userUpvote,
    userDownvote,
    userFavorite,
    postId,
    totalUpvote,
    totalDownvote
) {
    let interactionRow = document.createElement('div');
    interactionRow.classList.add('interactionRow');

    let likeAmount = document.createElement('span');
    likeAmount.classList.add('interactionText');
    let upvoteText;
    if (totalUpvote >= 1000000) {
        upvoteText = totalUpvote / 1000000 + ' m';
    } else if (totalUpvote >= 1000) {
        upvoteText = totalUpvote / 1000 + ' k';
    } else if (totalUpvote == null) {
        upvoteText = '0';
    } else {
        upvoteText = totalUpvote;
    }

    let likeButton = document.createElement('button');
    likeButton.setAttribute('type', 'button');
    likeButton.innerHTML = `<div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#314b49ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-thumbs-up"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg></div><span class="interactionText">${upvoteText}</span>`;
    likeButton.classList.add('interactionButton');
    if (userUpvote == 1) {
        likeButton.dataset.liked = 'true';
        likeButton.classList.add('activeLike');
    } else {
        likeButton.dataset.liked = 'false';
    }
    likeButton.addEventListener('click', function () {
        like(this, postId);
    });

    let dislikeButton = document.createElement('button');
    dislikeButton.setAttribute('type', 'button');

    let downvoteText;
    if (totalDownvote >= 1000000) {
        downvoteText = totalDownvote / 1000000 + ' m';
    } else if (totalDownvote >= 1000) {
        downvoteText = totalDownvote / 1000 + ' k';
    } else if (totalDownvote == null) {
        downvoteText = '0';
    } else {
        downvoteText = totalDownvote;
    }

    dislikeButton.innerHTML = `<div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#314b49ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-thumbs-down"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg></div><span class="interactionText">${downvoteText}</span>`;
    dislikeButton.classList.add('interactionButton');
    if (userDownvote == 1) {
        dislikeButton.dataset.disliked = 'true';
        dislikeButton.classList.add('activeLike');
    } else {
        dislikeButton.dataset.disliked = 'false';
    }
    dislikeButton.addEventListener('click', function () {
        dislike(this, postId);
    });

    let favoriteButton = document.createElement('button');
    favoriteButton.type = 'button';
    favoriteButton.classList.add('interactionButton');
    favoriteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg"viewBox="0 0 24 24" fill="none" stroke="#314b49ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    if (userFavorite == 1) {
        favoriteButton.dataset.favorite = 'true';
        favoriteButton.classList.add('activeFavorite');
    } else {
        favoriteButton.dataset.favorite = 'false';
    }
    favoriteButton.addEventListener('click', function () {
        favoritePost(this, postId);
    });

    let commentButton = document.createElement('button');
    commentButton.type = 'button';
    commentButton.classList.add('interactionButton');
    commentButton.dataset.postId = postId;
    commentButton.innerHTML = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   viewBox="0 0 20 19.999859"
   fill="none"
   stroke-width="2"
   stroke-linecap="round"
   stroke-linejoin="round"
   class="feather feather-message-square"
   version="1.1"
   id="svg1"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg">
  <defs
     id="defs1" />
  <path
     d="m 19,13 a 2,2 0 0 1 -2,2 H 5 L 1,19 V 3 A 2,2 0 0 1 3,1 h 14 a 2,2 0 0 1 2,2 z"
     id="path1"
     style="fill:none;fill-opacity:1;stroke:#212e00;stroke-opacity:1" />
  <rect
     style="fill:#212e00;fill-opacity:1;stroke:none;stroke-width:95.743;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1;paint-order:stroke fill markers"
     id="rect1"
     width="11"
     height="1.9641944"
     x="5.25"
     y="3.5170503"
     rx="0.91666669" />
  <rect
     style="fill:#212e00;fill-opacity:1;stroke:none;stroke-width:95.7424;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1;paint-order:stroke fill markers"
     id="rect1-8"
     width="11"
     height="1.9641944"
     x="5.25"
     y="7.0170503"
     rx="0.91666681" />
  <rect
     style="fill:#212e00;fill-opacity:1;stroke:none;stroke-width:95.7427;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1;paint-order:stroke fill markers"
     id="rect1-5"
     width="11"
     height="1.9641944"
     x="5.25"
     y="10.51705"
     rx="0.91666669" />
</svg>

`;
    commentButton.addEventListener('click', function () {
        showComments(this.dataset.postId);
    });

    interactionRow.appendChild(likeButton);
    interactionRow.appendChild(favoriteButton);
    interactionRow.appendChild(commentButton);
    interactionRow.appendChild(dislikeButton);

    return interactionRow;
}

const hangPictures = async (test) => {
    let posts = document.getElementById('posts-container');
    let post = document.createElement('div');
    post.classList.add('post');

    let ropediv = generateRope();
    let clip = generateClip();
    let slideshow = generateSlideshow(test.links);

    let timestamp = generateTimestamp(test.creation_date);
    slideshow.appendChild(timestamp);

    let tags = generateTags(test.tags);

    let description = generateDescription(test.description);

    let interactionRow = await generateInteractions(
        test.interactions[0].like,
        test.interactions[0].dislike,
        test.interactions[0].favorite,
        test.post_id,
        test.upvote,
        test.downvote
    );

    let postcontent = document.createElement('div');
    postcontent.classList.add('postContent');

    postcontent.appendChild(slideshow);

    postcontent.appendChild(interactionRow);
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

async function like(div, postId) {
    let dislikeDiv = div.parentNode.children[3];
    if (div.dataset.liked == 'true') {
        div.dataset.liked = 'false';
        div.classList.remove('activeLike');
        div.children[1].innerText = parseInt(div.children[1].innerText) - 1;
    } else {
        div.dataset.liked = 'true';
        div.classList.add('activeLike');
        div.children[1].innerText = parseInt(div.children[1].innerText) + 1;
        if (div.parentNode.children[3].dataset.disliked == 'true')
            dislikeDiv.children[1].innerText = parseInt(dislikeDiv.children[1].innerText) - 1;
    }
    dislikeDiv.dataset.disliked = 'false';
    dislikeDiv.classList.remove('activeLike');

    const { status } = await PostMethodFetch('/api/uploadInteraction', {
        postId: postId,
        likeValue: div.dataset.liked == 'true' ? true : false,
        dislikeValue: false
    });

    if (status != 'success') {
        console.log('Valami hiba történt a like-olás során');
    }
}

async function dislike(div, postId) {
    let likeDiv = div.parentNode.children[0];

    console.log(div.dataset.disliked);
    if (div.dataset.disliked == 'true') {
        div.dataset.disliked = 'false';
        div.classList.remove('activeLike');
        div.children[1].innerText = parseInt(div.children[1].innerText) - 1;
    } else {
        div.dataset.disliked = 'true';
        div.classList.add('activeLike');
        div.children[1].innerText = parseInt(div.children[1].innerText) + 1;
        if (likeDiv.dataset.liked == 'true')
            likeDiv.children[1].innerText = parseInt(likeDiv.children[1].innerText) - 1;
    }
    likeDiv.dataset.liked = 'false';
    likeDiv.classList.remove('activeLike');
    const { status } = await PostMethodFetch('/api/uploadInteraction', {
        postId: postId,
        likeValue: false,
        dislikeValue: div.dataset.disliked == 'true' ? true : false
    });

    if (status != 'success') {
        console.log('Valami hiba történt a dislike-olás során');
    }
}

async function favoritePost(div, postId) {
    if (div.dataset.favorite == 'true') {
        div.dataset.favorite = 'false';
        div.classList.remove('activeFavorite');
    } else {
        div.dataset.favorite = 'true';
        div.classList.add('activeFavorite');
    }
    const { status } = await PostMethodFetch('/api/favoritePost', {
        postId: postId,
        favoriteValue: div.dataset.favorite == 'true' ? true : false
    });
    if (status != 'success') console.log('Valami hiba történt a poszt elmentése során!');
}

function closeCommentModal(e, modal, modalContent) {
    let clickedOutside = e.target == modal;

    if (clickedOutside) {
        modalContent.style.animation = 'fadeOutDown 0.5s forwards';

        setTimeout(() => {
            modal.classList.add('hidden');
            modalContent.style.animation = '';
            document.getElementById('commentTextarea').value = '';
        }, 500);
    }
}

async function showComments(postId) {
    let modal = document.getElementById('commentModal');
    let modalContent = document.getElementById('commentModalContent');
    modalContent.replaceChildren();

    modal.dataset.postId = postId;
    modal.classList.remove('hidden');
    modal.removeEventListener('click', closeCommentModal);
    modal.addEventListener('click', () => {
        closeCommentModal(event, modal, document.getElementById('commentModalContentWrapper'));
    });

    const { status, results } = await GetMethodFetch('/api/commentInfos/' + postId);

    if (status == 'Success') {
        if (results.length == 0) {
            const encourageText = document.createElement('p');
            encourageText.innerText =
                'Még senki sem kommentelt ehhez a poszthoz.\nLegyél te az első!';
            encourageText.classList.add('encourageText');

            modalContent.appendChild(encourageText);
        } else {
            for (const commentData of results) {
                //console.log(commentData);
                modalContent.appendChild(generateComment(commentData));
            }
        }
    }
}

function generateCommentProfilePicture(src) {
    let profilePictureWrapper = document.createElement('div');
    profilePictureWrapper.classList.add('profilePictureWrapper');

    let profilePictureBorder = document.createElement('div');
    profilePictureBorder.classList.add('profilePictureBorder');

    let profilePicture = document.createElement('img');

    src != null
        ? (profilePicture.src = '/profile_images/' + src)
        : (profilePicture.src = 'profile_images/defaultProfile.svg');

    profilePicture.classList.add('commentProfilePicture');
    profilePicture.loading = 'lazy';
    profilePicture.alt = 'Profil Kép';

    profilePictureBorder.appendChild(profilePicture);
    profilePictureWrapper.appendChild(profilePictureBorder);

    return profilePictureWrapper;
}

function generateCommentContent(content) {
    let contentWrapper = document.createElement('div');
    contentWrapper.classList.add('commentContentWrapper');

    let commentContent = document.createElement('p');
    commentContent.innerText = content;
    commentContent.classList.add('commentContent');

    contentWrapper.appendChild(commentContent);
    return contentWrapper;
}

function generateCommentUsername(username) {
    let contentWrapper = document.createElement('div');
    contentWrapper.classList.add('commentUsernameWrapper');

    let commentUsername = document.createElement('p');
    commentUsername.innerText = username + ':';
    commentUsername.classList.add('commentUsername');

    contentWrapper.appendChild(commentUsername);
    return contentWrapper;
}

function generateCommentDate(date) {
    let contentWrapper = document.createElement('div');
    contentWrapper.classList.add('commentDateWrapper');

    let commentDate = document.createElement('p');
    let formattedDate = date_yyyy_MM_dd_hh_mm(date);
    commentDate.innerText = formattedDate.split(' ')[0] + '\n' + formattedDate.split(' ')[1];
    commentDate.classList.add('commentDate');

    contentWrapper.appendChild(commentDate);
    return contentWrapper;
}

function generateComment(commentData) {
    let commentWrapper = document.createElement('div');
    commentWrapper.classList.add('commentWrapper');

    let textWrapper = document.createElement('div');
    textWrapper.classList.add('commentTextWrapper');

    commentWrapper.appendChild(generateCommentProfilePicture(commentData.profile_picture_link));
    textWrapper.appendChild(generateCommentUsername(commentData.username));
    textWrapper.appendChild(generateCommentContent(commentData.comment_content));
    textWrapper.appendChild(generateCommentDate(commentData.comment_date));

    commentWrapper.appendChild(textWrapper);

    return commentWrapper;
}

function closeComments() {
    document.getElementById('commentModalContentWrapper').style.animation =
        'fadeOutDown 0.5s forwards';
    setTimeout(() => {
        document.getElementById('commentModal').classList.add('hidden');
        document.getElementById('commentModalContentWrapper').style.animation = '';
        document.getElementById('commentTextarea').value = '';
    }, 500);
}

async function sendComment() {
    const modal = document.getElementById('commentModal');
    const textarea = document.getElementById('commentTextarea');
    const message = textarea.value;
    if (message != '') {
        await PostMethodFetch('/api/uploadComment', {
            postId: modal.dataset.postId,
            commentContent: message
        });
        showComments(modal.dataset.postId);
        textarea.value = '';
    }
}
