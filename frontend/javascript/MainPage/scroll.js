let matchMedia = window.matchMedia('(width > 1000px)');
let scrollDistance = 0;
document.addEventListener('DOMContentLoaded', () => {
    let item = document.getElementById('posts-container');
    scrollDistance = item.scrollTop;
    if (matchMedia.matches) {
        item.addEventListener('wheel', scrollHorizontal);
    } else {
        item.addEventListener('wheel', hideTitleMobile);
    }
});

function hideTitleMobile() {
    let measuredScroll = this.scrollTop;
    console.log('ms: ' + measuredScroll + ' | sd: ' + scrollDistance);
    let title = document.getElementById('mobileTitleWrapper');
    if (measuredScroll > scrollDistance) {
        title.style.top = '-6vh';
        title.style.height = '0vh';
        title.children[0].style.opacity = '0';
    } else {
        title.style.top = '0';
        title.style.height = '6vh';
        title.children[0].style.opacity = '1';
    }
    scrollDistance = measuredScroll;
    console.log('ms: ' + measuredScroll + ' | sd: ' + scrollDistance);
}

function scrollHorizontal(e) {
    let target = e.target;
    let stopScrollClasses = ['postTag', 'postTagWrapper'];
    let j = 0;
    while (j < stopScrollClasses.length && !target.classList.contains(stopScrollClasses[j])) {
        j++;
    }

    if (matchMedia.matches && j == stopScrollClasses.length) {
        if (e.deltaY > 0) {
            this.scrollLeft += 700;
        } else {
            this.scrollLeft -= 700;
        }
    }
    //this.window.scrollTo(this.window.y)
}

window.addEventListener('resize', () => {
    let item = document.getElementById('posts-container');
    if (matchMedia.matches) {
        item.addEventListener('wheel', scrollHorizontal);
        item.removeEventListener('wheel', hideTitleMobile);

        document.getElementById('mobileSort').classList.add('hidden');
        document.getElementById('openSort').dataset.opened = 'false';
    } else {
        item.removeEventListener('wheel', scrollHorizontal);
        item.addEventListener('wheel', hideTitleMobile);
    }
});
