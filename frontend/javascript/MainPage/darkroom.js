document.addEventListener('DOMContentLoaded', () => {
    var item = document.getElementById('posts');
    item.addEventListener('wheel', function (e) {
        if (e.deltaY > 0) {
            item.scrollLeft += 500;
        } else {
            item.scrollLeft -= 500;
        }
        //this.window.scrollTo(this.window.y)
    });
    console.log(document.getElementById('asda'));
    //setTimeout(drawRope, 0.000001);
});

function drawSVG() {
    const paths = document.getElementsByClassName('path');
    for (const path of paths) {
        let width = path.parentNode.width.baseVal.value;
        let height = path.parentNode.height.baseVal.value;
        let d = `M 0 0 Q ${width / 2 - width * 0.25} ${height * 2 - height * 0.4} ${width} ${height * 0.5}`;
        path.setAttribute('d', d);
        path.setAttribute('stroke', 'wheat');
        path.setAttribute('stroke-width', '3');
        path.setAttribute('fill', 'none');
        console.log(width);
        console.log(height);
    }
}

function drawRope() {
    const XMAX = document.getElementById('svgRope').width.baseVal.value;
    const YMAX = document.getElementById('svgRope').height.baseVal.value;

    // Create path instructions
    const path = [];
    for (let x = 0; x <= XMAX; x++) {
        const angle = (x / XMAX) * Math.PI * 8 + 500; // angle = 0 -> 2π
        const y = Math.sin(angle) * (YMAX / 2) + YMAX / 2;
        // M = move to, L = line to
        path.push((x == 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2));
    }

    // Create PATH element
    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.setAttribute('d', path.join(' '));
    pathEl.style.stroke = 'blue';
    pathEl.style.fill = 'none';

    // Add it to svg element
    document.querySelector('svg').appendChild(pathEl);
}
