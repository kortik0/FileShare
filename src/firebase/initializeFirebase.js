import {initializeApp} from 'firebase/app'
import config from "../../config/config.json";

export const firebaseConfig = {
    ...config
}

export const initializer = () => initializeApp(firebaseConfig)