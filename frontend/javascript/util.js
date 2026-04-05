function date_yyyy_MM_dd(originDate) {
    const date = new Date(originDate);
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    if (month.toString().length == 1) {
        month = '0' + month.toString();
    }

    let day = date.getDate(date);
    if (day.toString().length == 1) {
        day = '0' + day.toString();
    }
    return `${year}-${month}-${day}`;
}

function date_yyyy_MM_dd_hh_mm(originDate) {
    const date = new Date(originDate);
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    if (month.toString().length == 1) {
        month = '0' + month.toString();
    }

    let day = date.getDate(date);
    if (day.toString().length == 1) {
        day = '0' + day.toString();
    }

    let hour = date.getHours(date);
    if (hour.toString().length == 1) {
        hour = '0' + hour.toString();
    }

    let minute = date.getMinutes(date);

    if (minute.toString().length == 1) {
        minute = '0' + minute.toString();
    }

    return `${year}-${month}-${day} ${hour}:${minute}`;
}

async function isLoggedIn() {
    try {
        const response = await GetMethodFetch('/api/sendUsername');
        return response.exists;
    } catch (error) {}
}

async function isAdmin() {
    const { Status } = await GetMethodFetch('/api/isAdmin');
    console.log(Status == 'success');
    return Status == 'success';
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

function closeModalByClickingOutside(e, modal, modalContent) {
    let clickedOutside = e.target == modal;

    if (clickedOutside) {
        modalContent.style.animation = 'fadeOutDown 0.5s forwards';

        setTimeout(() => {
            modal.classList.add('hidden');
            modalContent.style.animation = '';
        }, 500);
    }
}

function openProfile() {
    let profileURL = new URL('/profile', 'http://127.0.0.1:3000/');
    profileURL.searchParams.set('username', this.dataset.username);
    window.location.href = profileURL;
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

    if (slides[finalIndex].dataset.type == 'image') {
        slideshow.style.backgroundImage = `url(${slides[finalIndex].src})`;
    } else {
        slideshow.style.backgroundImage = `url("/images/videoBackground.png")`;
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

    console.log(links);
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
            if (i == 0) slideshow.style.backgroundImage = 'url("/images/videoBackground.png")';
        } else {
            media = document.createElement('img');
            media.src = '/uploads/' + content;
            media.alt = '/uploads/' + content;
            media.dataset.type = 'image';

            if (i == 0) slideshow.style.backgroundImage = `url("/uploads/${content}")`;
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

function generateTags(tags, location) {
    let wrapper = document.createElement('div');
    wrapper.classList.add('postTagWrapper');

    if (location != '') {
        let locationTag = document.createElement('span');
        locationTag.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> <span>${location}</span>`;
        locationTag.classList.add('postTag');
        wrapper.appendChild(locationTag);
    }

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
    console.log(userUpvote);
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
    commentButton.classList.add('interactionButton', 'commentButton');
    commentButton.dataset.postId = postId;
    commentButton.innerHTML = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   viewBox="0 0 20 19.999859"
   fill="none"
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
     style="fill:none;fill-opacity:1;stroke-opacity:1" />
  <rect
     style="fill-opacity:1;stroke:none;stroke-width:95.743;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1;paint-order:stroke fill markers"
     id="rect1"
     width="11"
     height="1.9641944"
     x="5.25"
     y="3.5170503"
     rx="0.91666669" />
  <rect
     style="fill-opacity:1;stroke:none;stroke-width:95.7424;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1;paint-order:stroke fill markers"
     id="rect1-8"
     width="11"
     height="1.9641944"
     x="5.25"
     y="7.0170503"
     rx="0.91666681" />
  <rect
     style="fill-opacity:1;stroke:none;stroke-width:95.7427;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1;paint-order:stroke fill markers"
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

function generateUserRow(name, profilePicture) {
    let wrapper = document.createElement('div');
    wrapper.classList.add('postUserRow');

    let imgWrapper = document.createElement('div');
    imgWrapper.classList.add('postUserImgWrapper');
    imgWrapper.addEventListener('click', openProfile);
    imgWrapper.dataset.username = name;

    let imgBorder = document.createElement('div');
    imgBorder.classList.add('postUserImgBorder');

    let img = document.createElement('img');
    img.src = profilePicture
        ? '/profile_images/' + profilePicture
        : '/profile_images/defaultProfile.jpg';
    img.alt = 'Profil Kép';
    img.classList.add('postUserImg');
    img.loading = 'lazy';

    imgBorder.appendChild(img);
    imgWrapper.appendChild(imgBorder);

    let username = document.createElement('span');
    username.classList.add('postUsername');
    username.innerText = name;
    username.dataset.username = name;
    username.addEventListener('click', openProfile);

    let report = document.createElement('div');
    report.classList.add('postUserReport');
    report.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"  stroke-linecap="round" stroke-linejoin="round" class="feather feather-flag"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>`;
    report.addEventListener('click', reportUser);

    wrapper.appendChild(imgWrapper);
    wrapper.appendChild(username);
    wrapper.appendChild(report);

    return wrapper;
}

async function reportUser() {
    const responseUser = await PostMethodFetch('/api/reportUser', {
        username: this.previousSibling.innerText
    });

    const responsePost = await PostMethodFetch('/api/reportPost', {
        postId: this.parentNode.parentNode.parentNode.dataset.postId
    });

    if (responsePost.Status == 'success' && responseUser.Status == 'success') {
        this.classList.add('reported');
        this.removeEventListener('click', reportUser);
    }
}

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

function generateCommentProfilePicture(src, username) {
    let profilePictureWrapper = document.createElement('div');
    profilePictureWrapper.classList.add('profilePictureWrapper');
    profilePictureWrapper.dataset.username = username;
    profilePictureWrapper.addEventListener('click', openProfile);

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
    contentWrapper.dataset.username = username;

    contentWrapper.addEventListener('click', openProfile);

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

    commentWrapper.appendChild(
        generateCommentProfilePicture(commentData.profile_picture_link, commentData.username)
    );
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
    if (message != '' && message.replace(/\s/g, '').length != 0) {
        await PostMethodFetch('/api/uploadComment', {
            postId: modal.dataset.postId,
            commentContent: message
        });
        showComments(modal.dataset.postId);
        textarea.value = '';
    }
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
