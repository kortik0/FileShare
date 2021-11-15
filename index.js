import {initializeApp} from 'firebase/app'
import axios from 'axios'

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
    return getUUID
}

const getAllFromFolder = async (id) => {
    const filePath = `images/${id}/`
    const filesURL = []

    await list(ref(storage, filePath)).then(r => r.items.forEach(item => {
        filesURL.push(item.fullPath)
    }))

    return filesURL
}

const downloadFromStorage = async (id) => {
    console.log(!id.length)
    if (!id.length) {
        id = 'testFolder'
    }

    console.log(id)

    const image = document.querySelector('.posts')
    const files = await getAllFromFolder(id)

   await files.forEach(item => {
        getDownloadURL(ref(storage, item)).then(async (response) => image.insertAdjacentHTML(
            'beforeend',
            `<div class="post">
                    <img class="image" src="${response}" alt="expected image">
                    <a href="${await axios.get(response, {
                        responseType: 'blob'
                    }).then(answer => {
                        return URL.createObjectURL(new Blob([answer.data]))
                    })}" download="${uuidv4()}.jpg"></a>
                    <div class="text"><p>${uuidv4()}</p></div>
                  </div>`
        ))
    })
}

/**
 * Firebase storage section
 * Should be in another file!
 * I am to lazy to do this now!
 * */

const chooseFile = () => {
    const bodyRoot = document.querySelector('.root')
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
        const id = document.querySelector('.identifier')
        if (!files.length) {
            console.error('Files section empty. Cancel operation')
            return
        }

        const response = uploadToStorage(files)
        id.innerHTML = `Your ID section: ${response}`
        imageHolder.innerHTML = ''
        files = []
    }

    const serverDownload = () => {
        bodyRoot.insertAdjacentHTML('beforeend',
    `<div class="Backdrop">
                <div class="form">
                    <div class="inputHolder">
                        <input class="inputRepos" type="text" placeholder="Insert id of repo"/>
                    </div>
                    <div class="buttonHolder">
                        <button class="submitBtn">Search repository</button>
                    </div>
                </div>
           </div>`
        )

        const btn = bodyRoot.querySelector('.submitBtn')
        btn.addEventListener('click', () => downloadFromStorage(bodyRoot.querySelector('.inputRepos').value))

        bodyRoot.querySelector('.Backdrop').addEventListener('click', (e) => {
            const element = e.target
            if (element.classList.contains('Backdrop')) {
                return element.parentNode.removeChild(element)
            }
        })
    }

    uploadButton.addEventListener('click', serverUpload)
    downloadButton.addEventListener('click', serverDownload)
    input.addEventListener('change', changeHandler)
}


chooseFile()