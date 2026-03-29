const DEFAULT_ACCESS_TOKEN_DURATION  = '15m';
const DEFAULT_REFRESH_TOKEN_DURATION = '7d';

const DURATION_UNITS_IN_MS = Object.freeze({
    ms: 1,
    s:  1000,
    m:  60 * 1000,
    h:  60 * 60 * 1000,
    d:  24 * 60 * 60 * 1000,
    w:  7 * 24 * 60 * 60 * 1000,
});

export const parseDurationToMs = (duration, fallback) => {
    const normalized = String(duration ?? fallback).trim();

    if (/^\d+$/.test(normalized)) return Number(normalized) * 1000;

    const match = normalized.match(/^(\d+)(ms|s|m|h|d|w)$/i);
    if (!match) {
        throw new Error(
            `Invalid duration "${normalized}". Use values like "15m", "1h", "7d".`
        );
    }

    const [, value, unit] = match;
    return Number(value) * DURATION_UNITS_IN_MS[unit.toLowerCase()];
};

const parseOrCrash = (value, fallback, name) => {
    try {
        return parseDurationToMs(value, fallback);
    } catch {
        throw new Error(`[Config] Invalid ${name}: "${value}". Check your .env file.`);
    }
};

export const ACCESS_TOKEN_DURATION  = process.env.ACCESS_TOKEN_DURATION  ?? DEFAULT_ACCESS_TOKEN_DURATION;
export const REFRESH_TOKEN_DURATION = process.env.REFRESH_TOKEN_DURATION ?? DEFAULT_REFRESH_TOKEN_DURATION;

export const ACCESS_TOKEN_DURATION_MS  = parseOrCrash(ACCESS_TOKEN_DURATION,  DEFAULT_ACCESS_TOKEN_DURATION,  'ACCESS_TOKEN_DURATION');
export const REFRESH_TOKEN_DURATION_MS = parseOrCrash(REFRESH_TOKEN_DURATION, DEFAULT_REFRESH_TOKEN_DURATION, 'REFRESH_TOKEN_DURATION');

export const COOKIE_NAMES = Object.freeze({
    ACCESS_TOKEN:  'accessToken',
    REFRESH_TOKEN: 'refresh_token',
});

const IS_PROD = process.env.NODE_ENV === 'production';

export const BASE_COOKIE_OPTIONS = Object.freeze({
    httpOnly: true,
    path:     '/',
    sameSite: IS_PROD ? 'strict' : 'lax',
    secure:   IS_PROD,
});

export const createExpiryDate = (durationInMs, now = Date.now()) =>
    new Date(now + durationInMs);

export const getAccessTokenCookieOptions = () => ({
    ...BASE_COOKIE_OPTIONS,
    maxAge: ACCESS_TOKEN_DURATION_MS,
});

export const getRefreshTokenCookieOptions = () => ({
    ...BASE_COOKIE_OPTIONS,
    maxAge: REFRESH_TOKEN_DURATION_MS,
});

export const CLEAR_COOKIE_OPTIONS = Object.freeze({
    ...BASE_COOKIE_OPTIONS,
    maxAge: 0,
});

export const getRefreshSessionExpiresAt = (now = Date.now()) =>
    createExpiryDate(REFRESH_TOKEN_DURATION_MS, now);
