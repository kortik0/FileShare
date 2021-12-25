import {uploadToStorage, downloadFromStorage} from "./firebase/storageWorker"
import {allElements} from "./utils/getDocumentElements";

const chooseFile = () => {
    let files = []

    const changeHandler = evt => {

        if (files.length > 0) {
            files = []
            allElements.imageHolder.innerHTML = ''
        }

        files = Array.from(evt.target.files)

        files.forEach(file => {
            const reader = new FileReader()
            reader.readAsDataURL(file)

            reader.onload = e => {
                allElements.imageHolder.insertAdjacentHTML(
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
        id.innerHTML = `Your ID section: <p style="user-select: all">${response}</p>`
        allElements.imageHolder.innerHTML = ''
        files = []
    }

    const serverDownload = () => {
        allElements.bodyRoot.insertAdjacentHTML('beforeend',
    `<div class="Backdrop">
                <div class="form">
                    <div class="inputHolder">
                        <input class="inputRepos" type="text" placeholder="Insert id of repo"/>
                        <label><input class="checkbox" type="checkbox"> Download as zip</label>
                    </div>
                    <div class="buttonHolder">
                        <button class="submitBtn">Search repository</button>
                    </div>
                </div>
           </div>`
        )

        const checked = document.querySelector('.checkbox')
        let isChecked = false

        checked.addEventListener('click', (e) => isChecked = e.target.checked)

        const inputReps = document.body.querySelector('.inputRepos')

        const btn = allElements.bodyRoot.querySelector('.submitBtn')
        btn.addEventListener('click', () => downloadFromStorage(inputReps.value, isChecked))

        allElements.bodyRoot.querySelector('.Backdrop').addEventListener('click', (e) => {
            const element = e.target
            if (element.classList.contains('Backdrop')) {
                return element.parentNode.removeChild(element)
            }
        })
    }

    allElements.uploadButton.addEventListener('click', serverUpload)
    allElements.downloadButton.addEventListener('click', serverDownload)
    allElements.input.addEventListener('change', changeHandler)
}


chooseFile()