//! SZÓLJATOK HA KELL MAGYARÁZAT, MERT ÉN BELE BOLONDULTAM MIRE MEGFEJTETTEM
//TODO Feltöltött képek megjelenítése, Posztoláskor elmentés
document.addEventListener('DOMContentLoaded', () => {
    const img = document.getElementById('test');
    getGPS(img.src).then((resolve) => {
        const { Latitude, Longitude } = resolve;
        console.log(Latitude + ' ' + Longitude);
    });

    document.getElementById('loadFiles').addEventListener('click', frame);
});

function frame() {
    let files = document.getElementById('uploadFile').files;
    let formData = new FormData();
    for (const file of files) {
        formData.append('uploadFile', file);
    }
    console.log(formData);

    fetch('http://127.0.0.1:3000/api/upload', {
        method: 'POST',
        body: formData
    });
    if (rightFileFormats(files)) {
    }
}

async function getGPS(file) {
    try {
        const tags = await ExifReader.load(file, {
            includeTags: {
                gps: true
            },
            expanded: true
        });
        return tags.gps;
    } catch (error) {
        console.error(error);
    }
}

function rightFileFormats(files) {
    let j = 0;
    while (j < files.length && fileFormats(files[j].type.split('/')[1])) {
        j++;
    }
    if (j >= files.length) {
        return true;
    } else {
        return false;
    }
}

function fileFormats(format) {
    return (
        format == 'mp4' ||
        format == 'avi' ||
        format == 'jpg' ||
        format == 'jpeg' ||
        format == 'png' ||
        format == 'jfif' ||
        format == 'png' ||
        format == 'gif' ||
        format == 'webp'
    );
}
function upload() {}
