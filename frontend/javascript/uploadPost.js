document.addEventListener('DOMContentLoaded', () => {
    /*
    const img = document.getElementById('test');
    getGPS('/temp_images/asd.jpg').then((resolve) => {
        const { Latitude, Longitude } = resolve;
        console.log(Latitude + ' ' + Longitude);
    });
    */
    document.getElementById('loadFiles').addEventListener('click', preLoadFiles);
    document.getElementById('uploadPost').addEventListener('click', uploadPost);
});

async function preLoadFiles() {
    let files = document.getElementById('uploadFile').files;
    let uploadFeedback = document.getElementById('uploadFeedback');

    uploadFeedback.innerText = '';
    if (rightFileFormats(files) && files.length > 0) {
        let response = await uploadFiles('/api/tempUpload', files);
        document.getElementById('uploadFeedback').innerText = response.Message;
        uploadFeedback.style.color = 'var(--successGreen)';

        generateCarousel(files);
    } else {
        uploadFeedback.innerText = 'Nem megfelelő egy vagy több fájl formátuma!';
        uploadFeedback.style.color = 'var(--invalidRed)';
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
        format == 'webp' ||
        format == 'hevc'
    );
}

function generateSlideForFile(file) {
    let fileType = file.type.split('/')[1];
    if (fileType == 'mp4' || fileType == 'avi' || fileType == 'hevc') {
        const video = document.createElement('video');
        const source = document.createElement('source');
        source.src = `temp_images/temp-${file.name}`;
        source.type = `video/${fileType}`;
        video.appendChild(source);
        video.classList.add('tempVideo');
        video.controls = true;
        return video;
    } else {
        const image = document.createElement('img');
        image.src = `/temp_images/temp-${file.name}`;
        image.classList.add('tempImage');
        return image;
    }
}

function slideShow(move) {
    let slides = document.getElementsByClassName('tempSlide');
    let j = 0;
    while (j < slides.length && slides[j].style.display == 'none') {
        j++;
    }
    slides[j].style.display = 'none';
    console.log();
    if (slides[j].children[1].classList.contains('tempVideo')) {
        slides[j].children[1].pause();
        slides[j].children[1].currentTime = 0;
    }
    console.log(j + ' ' + slides.length);
    if (j >= slides.length - 1 && move == 1) {
        slides[0].style.display = 'block';
    } else {
        if (j == 0 && move == -1) {
            slides[slides.length - 1].style.display = 'block';
        } else {
            slides[j + move].style.display = 'block';
        }
    }
}

function nextSlide() {
    slideShow(1);
}

function previousSlide() {
    slideShow(-1);
}

function generateCarousel(files) {
    const carouselContent = document.getElementById('carouselContent');
    carouselContent.replaceChildren();

    for (let i = 0; i < files.length; i++) {
        const slideDiv = document.createElement('div');
        slideDiv.classList.add('tempSlide');
        if (i != 0) {
            slideDiv.style.display = 'none';
        }

        const serialNumber = document.createElement('div');
        serialNumber.classList.add('tempSerialNumber');
        serialNumber.innerText = `${i + 1} / ${files.length}`;

        const file = generateSlideForFile(files[i]);

        slideDiv.appendChild(serialNumber);
        slideDiv.appendChild(file);
        carouselContent.appendChild(slideDiv);
    }
    if (files.length > 1) {
        const previous = document.createElement('a');
        previous.classList.add('slideShowController');

        previous.innerText = '🠈';
        previous.addEventListener('click', previousSlide);

        const next = document.createElement('a');
        next.classList.add('slideShowController');
        next.innerText = '🠊';
        next.addEventListener('click', nextSlide);

        carouselContent.appendChild(previous);
        carouselContent.appendChild(next);
    }
}

async function uploadPost() {
    let files = document.getElementById('uploadFile').files;
    let gps;
    (await getGPS(files[0])) == null
        ? (gps = { Latitude: null, Longitude: null })
        : (gps = await getGPS(files[0]));

    console.log(gps);
    if (files.length > 0 && rightFileFormats(files)) {
        let renamedFiles = [];
        for (let file of files) {
            let renamedFile = new File([file], `${Date.now()}-${file.name}`, {
                type: file.type
            });
            renamedFiles.push(renamedFile);
        }
        let fileNames = [];
        for (const file of renamedFiles) {
            fileNames.push(file.name);
        }
        console.log(renamedFiles);
        //! Élesben ezt a kódot kell használni! let username = sessionStorage.getItem('username');

        //! Csak teszthez
        let username = 'asd';

        let description = document.getElementById('uploadDescription').value;
        let location = document.getElementById('uploadLocation').value;
        await uploadFiles('/api/uploadPost', renamedFiles);
        await PostMethodFetch('/api/createPost', {
            username: username,
            fileNames: fileNames,
            description: description,
            tags: '',
            location: location,
            latitude: gps.Latitude,
            longitude: gps.Longitude
        });
        const carouselContent = document.getElementById('carouselContent');
        carouselContent.replaceChildren();
        document.getElementById('uploadFile').value = null;
    }
}

async function uploadFiles(apiUrl, files) {
    try {
        let formData = new FormData();
        for (const file of files) {
            formData.append('uploadFile', file);
        }
        let response = await fetch(apiUrl, {
            method: 'POST',
            body: formData
        });
        response = await response.json();
        return response;
    } catch (error) {
        return error;
    }
}
