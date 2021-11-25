import {getDownloadURL, getStorage, list, ref, uploadBytes} from "firebase/storage";
import {uuidv4} from "../utils/uuid";
import axios from "axios";
import * as zip from "@zip.js/zip.js";
import {crutch} from "../utils/zipDownload";
import {default as initializeApp, firebaseConfig} from "./initializeFirebase";

const storage = getStorage();

console.log(firebaseConfig, initializeApp)


export const uploadToStorage = (files) => {
    const getUUID = uuidv4()
    const filePath = `images/${getUUID}/`
    files.forEach(file => {
        const fileRef = ref(storage,`${filePath}/${file.name}`)
        uploadBytes(fileRef, file).then(() => {
            console.log('Uploaded a blob or file!');
        });
    })
    return getUUID
}

export const downloadFromStorage = async (id) => {
    if (!id.length) {
        id = 'testFolder'
    }

    console.log(id)

    const image = document.querySelector('.posts')
    const files = await getPathToFirebaseFolder(id)

    files.forEach(item => {
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

    const zipWriter = new zip.ZipWriter(new zip.Data64URIWriter("application/zip"))

    const getData = async () => {
        try {
            const filesURL = await axios.all(files.map(item => getDownloadURL(ref(storage, item))))
            return await axios.all(filesURL.map(item => axios.get(item, {responseType: "blob"})))
        } catch (e) {
            throw new Error(e)
        }
    }

    const data = await getData()

    const adderToZip = async (dataItem) => {
        await zipWriter.add(`${uuidv4()}.jpg`, new zip.BlobReader(dataItem))
    }

    await Promise.all(data.map(async (item) => await adderToZip(item.data)))

    const dataURI = await zipWriter.close()
    crutch(dataURI)
}


const getPathToFirebaseFolder = async (id) => {
    const filePath = `images/${id}/`
    const filesURL = []

    await list(ref(storage, filePath)).then(r => r.items.forEach(item => {
        filesURL.push(item.fullPath)
    }))

    return filesURL
}