document.addEventListener('DOMContentLoaded', () => {
    //testFunction();
    getTopPosts();
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

const getTopPosts = async () => {
    try {
        const response = await GetMethodFetch('/api/topPosts');
        const data = response.results;
        //console.log(response);

        for (let i = 0; i < data.length; i++) {
            hangPictures(data[i]);
        }
    } catch (error) {
        console.error('Hiba' + error);
    }
};

const hangPictures = async (test) => {
    let posts = document.getElementById('posts-container');
    let post = document.createElement('div');
    post.classList.add('post');

    let ropediv = document.createElement('div');
    let rope = document.createElement('hr');
    let ropetexture = document.createElement('hr');
    ropediv.classList.add('ropeDiv');
    rope.classList.add('rope');
    ropetexture.classList.add('ropeTexture');

    let clip = document.createElement('div');
    let imgclip = document.createElement('div');
    let imgcliptexture = document.createElement('div');
    clip.classList.add('clip');
    imgclip.classList.add('imgClip');
    imgcliptexture.classList.add('imgClipTexture');

    let postcontent = document.createElement('div');
    let imgdiv = document.createElement('div');
    let img = document.createElement('img');
    postcontent.classList.add('postContent');
    imgdiv.classList.add('imgDiv');

    let p = document.createElement('p');

    let interactionsResult = await GetMethodFetch('/api/interactions/' + test.post_id);
    let interactionRow = document.createElement('div');
    interactionRow.classList.add('likeDiv');

    let likeButton = document.createElement('button');
    likeButton.setAttribute('type', 'button');
    likeButton.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#314b49ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-thumbs-up"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>';
    likeButton.classList.add('interactionButton');
    if (interactionsResult.results.upvote == 1) {
        likeButton.dataset.liked = 'true';
        likeButton.classList.add('activeLike');
    } else {
        likeButton.dataset.liked = 'false';
    }
    likeButton.addEventListener('click', function () {
        like(this, test.post_id);
    });

    let dislikeButton = document.createElement('button');
    dislikeButton.setAttribute('type', 'button');
    dislikeButton.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#314b49ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-thumbs-down"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>';
    dislikeButton.classList.add('interactionButton');
    if (interactionsResult.results.downvote == 1) {
        dislikeButton.dataset.disliked = 'true';
        dislikeButton.classList.add('activeLike');
    } else {
        dislikeButton.dataset.disliked = 'false';
    }
    dislikeButton.addEventListener('click', function () {
        dislike(this, test.post_id);
    });

    let favoriteResult = await GetMethodFetch('/api/isFavorited/' + test.post_id);
    let favoriteButton = document.createElement('button');
    favoriteButton.type = 'button';
    favoriteButton.classList.add('interactionButton');
    favoriteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg"viewBox="0 0 24 24" fill="none" stroke="#314b49ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    if (favoriteResult.results.is_favorited == 1) {
        favoriteButton.dataset.favorite = 'true';
        favoriteButton.classList.add('activeFavorite');
    } else {
        favoriteButton.dataset.favorite = 'false';
    }
    favoriteButton.addEventListener('click', function () {
        favoritePost(this, test.post_id);
    });

    let commentButton = document.createElement('button');
    commentButton.type = 'button';
    commentButton.classList.add('interactionButton');
    commentButton.dataset.postId = test.post_id;
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

    /*
    let tableContainer = document.createElement('div');
    let commentsTable = document.createElement('table');
    let tBody = document.createElement('tbody');
    tableContainer.classList.add('tableContainer');
    commentsTable.classList.add('commentsTable');
    tBody.classList.add('tBody');

    let tRow = document.createElement('tr');
    let commentingUserPic = document.createElement('td');
    let commentingUserImg = document.createElement('img');
    let commentingUser = document.createElement('span');
    let comment = document.createElement('td');
    tRow.classList.add('tRow');
    commentingUserPic.classList.add('commentingUserPic');
    commentingUserImg.classList.add('commentingUserImg');
    commentingUser.classList.add('commentingUser');
    comment.classList.add('comment');

    p.innerHTML = test.description;
    img.src = '/uploads/' + test.pic;

    const response2 = await PostMethodFetch('/api/commentInfos', { post_id: test.post_id });
    const data2 = response2.results;
    let userName;
    let userPic;
    let text;
    for (let i = 0; i < data2.length; i++) {
        userName = data2[i].username;
        userPic = data2[i].profile_picture_link;
        text = data2[i].comment_content;
        console.log('username: ' + userName);
        console.log('userpic: ' + userPic);
        console.log('text: ' + text);
    }

    commentingUserImg.src = '/uploads/' + userPic;
    commentingUser.innerHTML = userName;
    comment.innerHTML = text;*/

    imgdiv.appendChild(img);
    postcontent.appendChild(imgdiv);
    postcontent.appendChild(p);

    interactionRow.appendChild(likeButton);
    interactionRow.appendChild(favoriteButton);
    interactionRow.appendChild(commentButton);
    interactionRow.appendChild(dislikeButton);
    postcontent.appendChild(interactionRow);

    /*
    commentingUserPic.appendChild(commentingUserImg);
    commentingUserPic.appendChild(commentingUser);
    tRow.appendChild(commentingUserPic);
    tRow.appendChild(comment);
    tBody.appendChild(tRow);
    commentsTable.appendChild(tBody);
    tableContainer.appendChild(commentsTable);
    postcontent.appendChild(tableContainer);*/

    clip.appendChild(imgclip);
    clip.appendChild(imgcliptexture);

    ropediv.appendChild(rope);
    ropediv.appendChild(ropetexture);

    post.appendChild(ropediv);
    post.appendChild(clip);
    post.appendChild(postcontent);
    post.dataset.postId = test.post_id;

    const options = {
        root: posts,
        threshold: 0
    };

    const callback = (entries) => {
        entries.forEach((element) => {
            if (element.isIntersecting) {
                let postContent = element.target.children[2];
                postContent.style.animation = 'fadeInUp 0.5s forwards';
            }
        });
    };
    const observer = new IntersectionObserver(callback, options);

    observer.observe(post);

    posts.appendChild(post);
};

async function like(div, postId) {
    if (div.dataset.liked == 'true') {
        div.dataset.liked = 'false';
        div.classList.remove('activeLike');
    } else {
        div.dataset.liked = 'true';
        div.classList.add('activeLike');
    }
    div.parentNode.children[2].dataset.disliked = 'false';
    div.parentNode.children[2].classList.remove('activeLike');

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
    console.log(div.dataset.disliked);
    if (div.dataset.disliked == 'true') {
        div.dataset.disliked = 'false';
        div.classList.remove('activeLike');
    } else {
        div.dataset.disliked = 'true';
        div.classList.add('activeLike');
    }
    div.parentNode.children[0].dataset.liked = 'false';
    div.parentNode.children[0].classList.remove('activeLike');
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
    let formattedDate = date_yyyy_MM_dd_hh_mm_ss(date);
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
