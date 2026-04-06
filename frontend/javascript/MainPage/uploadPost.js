document.addEventListener('DOMContentLoaded', () => {
    /*
    const img = document.getElementById('test');
    getGPS('/temp_images/asd.jpg').then((resolve) => {
        const { Latitude, Longitude } = resolve;
        console.log(Latitude + ' ' + Longitude);
    });
    */
    document.getElementById('uploadPost').addEventListener('click', uploadPost);
    document.getElementById('cancelPost').addEventListener('click', closePost);
    document.getElementById('uploadFile').addEventListener('change', preLoadFiles);
    document
        .getElementById('uploadDescription')
        .addEventListener('keyup', currentDescriptionLength);
    document.getElementById('uploadTags').addEventListener('keydown', function (e) {
        if (e.key == 'Enter') {
            e.preventDefault();
            generateTag(this);
        }
    });
});

function currentDescriptionLength() {
    document.getElementById('descriptionLength').innerText = this.value.length + '/500';
}

function generateTag(input) {
    let existingTags = document.querySelectorAll('.addedTag');
    let alreadyAdded = false;
    for (const tag of existingTags) {
        if (tag.innerText == '#' + input.value) {
            alreadyAdded = true;
        }
    }
    if (input.value.replace(/\s/g, '').length != 0 && !alreadyAdded) {
        let newTag = document.createElement('div');
        newTag.innerText = '#' + input.value;
        newTag.classList.add('addedTag');
        newTag.addEventListener('click', removeTag);
        document.getElementById('forTags').appendChild(newTag);
        input.value = '';
    }
}

function removeTag() {
    this.remove();
}

async function preLoadFiles() {
    let files = document.getElementById('uploadFile').files;
    let uploadFeedback = document.getElementById('uploadFeedback');

    uploadFeedback.innerText = '';
    if (rightFileFormats(files) && files.length > 0) {
        let renamedFiles = [];
        let links = [];
        for (let file of files) {
            let renamedFile = new File(
                [file],
                file.name
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/\.(?=.*\.)/g, '-'),
                {
                    type: file.type
                }
            );
            renamedFiles.push(renamedFile);
            links.push('../temp_images/temp-' + renamedFile.name);
        }
        console.log(links);
        let response = await uploadFiles('/api/tempUpload', renamedFiles);
        document.getElementById('uploadFeedback').innerText = response.Message;
        uploadFeedback.style.color = 'var(--successGreen)';

        document.getElementById('tempSlideshowWrapper').replaceChildren();
        document.getElementById('tempSlideshowWrapper').appendChild(generateSlideshow(links));
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

async function uploadPost() {
    try {
        let files = document.getElementById('uploadFile').files;

        if (files.length > 0 && rightFileFormats(files)) {
            let gps;
            (await getGPS(files[0])) == null
                ? (gps = { Latitude: null, Longitude: null })
                : (gps = await getGPS(files[0]));

            let renamedFiles = [];
            for (let file of files) {
                let renamedFile = new File(
                    [file],
                    file.name
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')

                        //? keres egy pontot (\.) ha utána van még pont (?=.*\.) (asszem)
                        .replace(/\.(?=.*\.)/g, '-'),
                    {
                        type: file.type
                    }
                );
                renamedFiles.push(renamedFile);
            }

            let description = document.getElementById('uploadDescription').value;
            let location = document.getElementById('uploadLocation').value;
            let tags = document.querySelectorAll('.addedTag');
            let uploadTags = '';
            for (let tag of tags) {
                uploadTags += tag.innerText + ' ';
            }
            const usernameResponse = await GetMethodFetch('/api/sendUsername');
            const uploadResponse = await uploadFiles('/api/uploadPost', renamedFiles);
            let uploadedFiles = [];
            for (const object of uploadResponse.filenames) {
                uploadedFiles.push(object.filename);
            }

            const createPostResponse = await PostMethodFetch('/api/createPost', {
                username: usernameResponse.Result,
                fileNames: uploadedFiles,
                description: description,
                tags: uploadTags,
                location: location,
                latitude: gps.Latitude,
                longitude: gps.Longitude
            });

            if (createPostResponse.Success) {
                closePost();
            }
        } else {
            document.getElementById('uploadFileLabelText').classList.add('invalid');
            document.getElementById('tempSlideshowWrapper').classList.add('invalid');
        }
    } catch (error) {
        console.error(error);
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

function closePost() {
    let modal = document.getElementById('uploadModal');
    let modalContent = document.getElementById('uploadModalContent');
    let form = document.getElementById('uploadForm');
    modalContent.style.animation = 'fadeOutDown 0.5s forwards';
    setTimeout(() => {
        for (let element of document.querySelectorAll('.invalid')) {
            element.classList.remove('invalid');
        }

        modal.classList.add('hidden');
        modal.removeEventListener('click', closeModalByClickingOutside);

        modalContent.style.animation = '';

        const carouselContent = document.getElementById('tempSlideshowWrapper');
        carouselContent.replaceChildren();

        let uploadInfo = document.createElement('div');
        uploadInfo.classList.add('uploadInfo');
        uploadInfo.innerText = 'Itt láthatja a feltöltött képeket';

        carouselContent.appendChild(uploadInfo);

        document.getElementById('uploadFeedback').innerText = '';

        document.getElementById('forTags').replaceChildren();

        document.getElementById('descriptionLength').innerText = '0/500';

        form.reset();
    }, 500);
}
