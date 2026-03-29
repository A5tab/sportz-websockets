import jwt from 'jsonwebtoken'
import {
    ACCESS_TOKEN_DURATION,
    REFRESH_TOKEN_DURATION,
} from '../config/cookie.config.js'

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET

export const generateAccessToken = (data) => {
    return jwt.sign({ data }, accessTokenSecret, { expiresIn: ACCESS_TOKEN_DURATION })
}

export const generateAcessToken = generateAccessToken

export const generateRefreshToken = (data) => {
    return jwt.sign({ data }, refreshTokenSecret, { expiresIn: REFRESH_TOKEN_DURATION })
}

export const verifyAccessToken = (token) => {
    return jwt.verify(token, accessTokenSecret)
}

export const verifyRefreshToken = (token) => {
    return jwt.verify(token, refreshTokenSecret)
}