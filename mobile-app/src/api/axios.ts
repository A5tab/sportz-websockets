import axios from 'axios'
const baseUrl = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || "http://localhost:3000";


export default axios.create({
    baseURL: baseUrl,
})


export const apiPrivate = axios.create({
    baseURL: baseUrl,
    headers: {
        "Content-Type": 'multipart/formdata',
    },
    withCredentials: true
})
