document.addEventListener('DOMContentLoaded', () => {
    getTopPosts();
});

function base(data, i) {
    console.log('mukudik');

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
        console.log(response);

        for (let i = 0; i < data.length; i++) {
            console.log('ciklus');
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

    let likeDiv = document.createElement('div');
    let likeButton = document.createElement('input');
    likeButton.setAttribute('type', 'button');
    likeButton.setAttribute('id', 'likeButton');
    let dislikeButton = document.createElement('input');
    dislikeButton.setAttribute('type', 'button');
    dislikeButton.setAttribute('id', 'dislikeButton');


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

    likeRow.appendChild(likeButton);
    likeRow.appendChild(dislikeButton);
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

    posts.appendChild(post);
};
