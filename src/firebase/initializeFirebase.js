import {initializeApp} from 'firebase/app'
import config from "../../config/appConfig.json";

export const firebaseConfig = {
    ...config
}

export default initializeApp(firebaseConfig)