export function hideTitleMobile(div, scrollDistance) {
    let measuredScroll = div.scrollTop;
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
    return measuredScroll;
}

export function scrollHorizontal(e, div, matchMedia) {
    let target = e.target;
    let stopScrollClasses = ['postTag', 'postTagWrapper'];
    let j = 0;
    while (j < stopScrollClasses.length && !target.classList.contains(stopScrollClasses[j])) {
        j++;
    }

    if (matchMedia.matches && j == stopScrollClasses.length) {
        if (e.deltaY > 0) {
            div.scrollLeft += 700;
        } else {
            div.scrollLeft -= 700;
        }
    }
}
