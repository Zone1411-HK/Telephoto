document.addEventListener('DOMContentLoaded', () => {
    testFunction();
    getTopPosts();
});

async function testFunction() {
    const response = await PostMethodFetch('/api/saveUsername', {
        username: 'test'
    });
}

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
}

const getTopPosts = async () => {
    try {
        const response = await GetMethodFetch('/api/topPosts');
        const data = response.results;
        //console.log(response);

        for (let i = 0; i < data.length; i++) {
            const test = base(data, i);
            /*             console.log(test);

            console.log('név' + test.username);
            console.log('userpic' + test.userpic);
            console.log('pic' + test.pic);
            console.log('desc' + test.description);
            console.log('tag' + test.tags);
            console.log('loc' + test.location);
            console.log('lat' + test.latitude);
            console.log('lon' + test.longitude);
            console.log('create' + test.creation_date);
            console.log('postid' + test.post_id); */

            hangPictures(test);
        }
    } catch (error) {
        console.error('Hiba' + error);
    }
};

const hangPictures = async (test) => {
    let posts = document.getElementById('posts');
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
    let likeDiv = document.createElement('div');
    likeDiv.classList.add('likeDiv');

    let likeButton = document.createElement('button');
    likeButton.setAttribute('type', 'button');
    likeButton.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#314b49ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-thumbs-up"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>';
    likeButton.classList.add('likeButton');
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
    dislikeButton.classList.add('likeButton');
    if (interactionsResult.results.downvote == 1) {
        dislikeButton.dataset.disliked = 'true';
        dislikeButton.classList.add('activeLike');
    } else {
        dislikeButton.dataset.disliked = 'false';
    }
    dislikeButton.addEventListener('click', function () {
        dislike(this, test.post_id);
    });

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
    comment.innerHTML = text;

    imgdiv.appendChild(img);
    postcontent.appendChild(imgdiv);
    postcontent.appendChild(p);

    likeDiv.appendChild(likeButton);
    likeDiv.appendChild(dislikeButton);
    postcontent.appendChild(likeDiv);

    commentingUserPic.appendChild(commentingUserImg);
    commentingUserPic.appendChild(commentingUser);
    tRow.appendChild(commentingUserPic);
    tRow.appendChild(comment);
    tBody.appendChild(tRow);
    commentsTable.appendChild(tBody);
    tableContainer.appendChild(commentsTable);
    postcontent.appendChild(tableContainer);

    clip.appendChild(imgclip);
    clip.appendChild(imgcliptexture);

    ropediv.appendChild(rope);
    ropediv.appendChild(ropetexture);

    post.appendChild(ropediv);
    post.appendChild(clip);
    post.appendChild(postcontent);
    post.dataset.postId = test.post_id;

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
    div.parentNode.children[1].dataset.disliked = 'false';
    div.parentNode.children[1].classList.remove('activeLike');

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
