export const API_CONFIG = {};

export const MAP_CONFIG = {
    MAPTILER_API_KEY: process.env.EXPO_PUBLIC_MAPTILER_API_KEY || '',
    STYLE_URL: `https://api.maptiler.com/maps/basic-v2/style.json?key=${
        process.env.EXPO_PUBLIC_MAPTILER_API_KEY || ''
    }`,
};
