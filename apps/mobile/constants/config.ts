export const API_CONFIG = {
    BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000',
};

export const MAP_CONFIG = {
    MAPTILER_API_KEY: process.env.EXPO_PUBLIC_MAPTILER_API_KEY || '',
    STYLE_URL: `https://api.maptiler.com/maps/basic-v2/style.json?key=${
        process.env.EXPO_PUBLIC_MAPTILER_API_KEY || ''
    }`,
};
