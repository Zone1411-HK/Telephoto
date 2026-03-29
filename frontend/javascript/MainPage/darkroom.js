document.addEventListener('DOMContentLoaded', () => {
    let matchMedia = window.matchMedia('(width > 1000px)');

    let item = document.getElementById('posts-container');
    item.addEventListener('wheel', function (e) {
        let target = e.target;
        let stopScrollClasses = ['postTag', 'postTagWrapper'];
        let j = 0;
        while (j < stopScrollClasses.length && !target.classList.contains(stopScrollClasses[j])) {
            j++;
        }

        console.log(j);

        if (matchMedia.matches && j == stopScrollClasses.length) {
            if (e.deltaY > 0) {
                item.scrollLeft += 750;
            } else {
                item.scrollLeft -= 750;
            }
        }
        //this.window.scrollTo(this.window.y)
    });
});
