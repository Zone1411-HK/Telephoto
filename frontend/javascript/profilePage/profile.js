const socket = io();
document.addEventListener('DOMContentLoaded', () => {
    let posts = document.querySelectorAll('.post');
    for (let post of posts) {
        let src = post.children[0].children[0].src;
        src = '../' + src.split('3000/')[1];
        let url = "url(\'" + src + "')";
        console.log(url);
        post.style.backgroundImage = url;
    }
});
