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
    document.getElementById('cancelPost').addEventListener('click', cancelPost);
});

async function preLoadFiles() {
    let files = document.getElementById('uploadFile').files;
    let uploadFeedback = document.getElementById('uploadFeedback');

    uploadFeedback.innerText = '';
    if (rightFileFormats(files) && files.length > 0) {
        let renamedFiles = [];
        for (let file of files) {
            let renamedFile = new File(
                [file],
                file.name.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
                {
                    type: file.type
                }
            );
            renamedFiles.push(renamedFile);
        }
        console.log(renamedFiles);
        let response = await uploadFiles('/api/tempUpload', renamedFiles);
        document.getElementById('uploadFeedback').innerText = response.Message;
        uploadFeedback.style.color = 'var(--successGreen)';

        generateCarousel(renamedFiles);
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
        video.classList.add('tempVideo', 'img-fluid');
        video.controls = true;
        return video;
    } else {
        const image = document.createElement('img');
        image.src = `/temp_images/temp-${file.name}`;
        image.classList.add('tempImage', 'img-fluid', 'circle');
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
        slides[0].style.display = 'flex';
    } else {
        if (j == 0 && move == -1) {
            slides[slides.length - 1].style.display = 'flex';
        } else {
            slides[j + move].style.display = 'flex';
        }
    }
}

function nextSlide() {
    this.style.pointerEvents = 'none';
    setTimeout(() => {
        this.style.pointerEvents = 'all';
    }, 1);
    slideShow(1);
}

function previousSlide() {
    this.style.pointerEvents = 'none';
    setTimeout(() => {
        this.style.pointerEvents = 'all';
    }, 1);
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
        previous.classList.add('slideShowController', 'slideShowControllerLeft');

        previous.innerText = '🠈';
        previous.addEventListener('click', previousSlide);

        const next = document.createElement('a');
        next.classList.add('slideShowController', 'slideShowControllerRight');
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
            let renamedFile = new File(
                [file],
                file.name.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
                {
                    type: file.type
                }
            );
            renamedFiles.push(renamedFile);
        }

        console.log(renamedFiles);

        let description = document.getElementById('uploadDescription').value;
        let location = document.getElementById('uploadLocation').value;
        const usernameResponse = await GetMethodFetch('/api/sendUsername');
        console.log(usernameResponse);
        const uploadResponse = await uploadFiles('/api/uploadPost', renamedFiles);
        console.log(uploadResponse);
        let uploadedFiles = [];
        for (const object of uploadResponse.filenames) {
            uploadedFiles.push(object.filename);
        }

        const createPostResponse = await PostMethodFetch('/api/createPost', {
            username: usernameResponse.Result,
            fileNames: uploadedFiles,
            description: description,
            tags: '',
            location: location,
            latitude: gps.Latitude,
            longitude: gps.Longitude
        });

        if (createPostResponse.Success) {
            window.location.reload();
        }
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

function cancelPost() {
    document.getElementById('uploadFile').value = null;
    document.getElementById('carouselContent').replaceChildren();
    document.getElementById('uploadFeedback').innerText = '';
}
