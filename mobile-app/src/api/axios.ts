import axios from 'axios'
export const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:3000'


export default axios.create({
    baseURL: BASE_URL,
})


export const apiPrivate = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": 'multipart/formdata',
    },
    withCredentials: true
})
