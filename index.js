import {initializeApp} from 'firebase/app'

const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

initializeApp(firebaseConfig);

/**
 * Firebase init section above
 * Should move to another file!
 * I am to lazy to do this now!
 **/

const uuidv4 = () => {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}

/**
 * UUID should be written on front-end
 * and be moved to another file
 * I am to lazy to do this now!
 **/

import { getStorage, ref, uploadBytes, list, getDownloadURL} from "firebase/storage";
const storage = getStorage();

const uploadToStorage = (files) => {
    const getUUID = uuidv4()
    const filePath = `images/${getUUID}/`
    console.log(getUUID)
    files.forEach(file => {
        const fileRef = ref(storage,`${filePath}/${file.name}`)
        uploadBytes(fileRef, file).then((snapshot) => {
            console.log('Uploaded a blob or file!');
            console.log(snapshot);
        });
    })
}

const getAllFromFolder = async () => {
    const filePath = `images/d3d0afa2-877e-4915-bab4-4311600cd48c/`
    const filesURL = []

    await list(ref(storage, filePath)).then(r => r.items.forEach(item => {
        filesURL.push(item.fullPath)
    }))

    return filesURL
}

const downloadFromStorage = async () => {
    const image = document.querySelector('.posts')
    const files = await getAllFromFolder()

    files.forEach(item => {
        getDownloadURL(ref(storage, item)).then(response => image.insertAdjacentHTML(
            'beforeend',
            `<div class="post">
                    <img class="image" src="${response}" alt="expected image">
                    <a href="${response}" download></a>
                    <div class="text"><p>${uuidv4()}</p></div>
                  </div>`
        ))
    })
    //Make download logic!
}

/**
 * Firebase storage section
 * Should be in another file!
 * I am to lazy to do this now!
 * */

const chooseFile = () => {
    const input = document.querySelector('#inputData')
    const uploadButton = document.querySelector('#uploadData')
    const downloadButton = document.querySelector('#downloadData')
    const imageHolder = document.querySelector('.posts')

    let files = []

    const changeHandler = evt => {

        if (files.length > 0) {
            files = []
            imageHolder.innerHTML = ''
        }

        files = Array.from(evt.target.files)

        files.forEach(file => {
            const reader = new FileReader()
            reader.readAsDataURL(file)

            reader.onload = e => {
                imageHolder.insertAdjacentHTML(
                    'beforeend',
                    `<div class="post">
                            <img class="image" src="${e.target.result}" alt="expected image">
                            <div class="text"><p>${file.name}</p></div>
                          </div>`
                )
            }
        })
    }

    const serverUpload = () => {
        if (!files.length) {
            console.error('Files section empty. Cancel operation')
            return
        }

        uploadToStorage(files)
        imageHolder.innerHTML = ''
        files = []
    }

    const serverDownload = () => {
        downloadFromStorage()
    }

    uploadButton.addEventListener('click', serverUpload)
    downloadButton.addEventListener('click', serverDownload)
    input.addEventListener('change', changeHandler)
}


chooseFile()