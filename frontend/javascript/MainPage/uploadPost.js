import * as utilFunctions from '../util.js';

export function currentDescriptionLength() {
    document.getElementById('descriptionLength').innerText = this.value.length + '/500';
}

export function generateTag(input) {
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
        newTag.addEventListener('click', function () {
            this.remove();
        });
        document.getElementById('forTags').appendChild(newTag);
        input.value = '';
    }
}

export async function preLoadFiles() {
    let files = document.getElementById('uploadFile').files;
    let uploadFeedback = document.getElementById('uploadFeedback');

    uploadFeedback.innerText = '';
    if (rightFileFormats(files) && files.length > 0) {
        document.getElementById('uploadPost').addEventListener('click', uploadPost);
        document.getElementById('uploadPost').classList.remove('disabledButton');
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
        document
            .getElementById('tempSlideshowWrapper')
            .appendChild(utilFunctions.generateSlideshow(links));
    } else {
        uploadFeedback.innerText = 'Nem megfelelő egy vagy több fájl formátuma!';
        uploadFeedback.style.color = 'var(--invalidRed)';
    }
}

export async function getGPS(file) {
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

export function rightFileFormats(files) {
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

export function fileFormats(format) {
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

export async function uploadPost() {
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
                uploadClose();
            }
        } else {
            document.getElementById('uploadFileLabelText').classList.add('invalid');
            document.getElementById('tempSlideshowWrapper').classList.add('invalid');
        }
    } catch (error) {
        console.error(error);
    }
}

export async function uploadFiles(apiUrl, files) {
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

export function uploadClose() {
    let modal = document.getElementById('uploadModal');
    let modalContent = document.getElementById('uploadModalContent');
    let flash = document.getElementById('flash');
    let form = document.getElementById('uploadForm');
    let carouselContent = document.getElementById('tempSlideshowWrapper');
    let uploadInfo = document.createElement('div');

    modalContent.style.animation = '';
    modalContent.classList.add('hidden');

    flash.classList.remove('hidden');

    setTimeout(() => {
        flash.style.animation = 'flashout 0.5s forwards';
    }, 250);

    for (let element of document.querySelectorAll('.invalid')) {
        element.classList.remove('invalid');
    }

    carouselContent.replaceChildren();

    uploadInfo.classList.add('uploadInfo');
    uploadInfo.innerText = 'Itt láthatja a feltöltött képeket';
    carouselContent.appendChild(uploadInfo);

    document.getElementById('uploadFeedback').innerText = '';
    document.getElementById('forTags').replaceChildren();
    document.getElementById('descriptionLength').innerText = '0/500';
    document.getElementById('uploadPost').removeEventListener('click', uploadPost);
    document.getElementById('uploadPost').classList.add('disabledButton');

    form.reset();
    modal.removeEventListener('click', utilFunctions.closeModalByClickingOutside);

    setTimeout(() => {
        modal.classList.add('hidden');
        modalContent.classList.remove('hidden');

        flash.classList.add('hidden');

        flash.style.animation = '';
    }, 750);
}

export function closePost() {
    let modal = document.getElementById('uploadModal');
    let modalContent = document.getElementById('uploadModalContent');

    let form = document.getElementById('uploadForm');
    modalContent.style.animation = 'fadeOutDown 0.5s forwards';
    setTimeout(() => {
        for (let element of document.querySelectorAll('.invalid')) {
            element.classList.remove('invalid');
        }

        modal.classList.add('hidden');
        modal.removeEventListener('click', utilFunctions.closeModalByClickingOutside);

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

        document.getElementById('uploadPost').removeEventListener('click', uploadPost);
        document.getElementById('uploadPost').classList.add('disabledButton');

        form.reset();
    }, 500);
}
