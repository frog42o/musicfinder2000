import axios from 'axios';

const SPOTIFY_AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

export const getSpotifyAuthUrl = (): string => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
    const scopes = [
        "user-read-private",
        "user-read-email",
        "playlist-read-private",
        "playlist-modify-private",
        "playlist-modify-public",
        "playlist-modify-private",
        "user-read-recently-played",
        "user-top-read"
    ].join(" ");
    const url = `${SPOTIFY_AUTH_ENDPOINT}?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
    )}&scope=${encodeURIComponent(scopes)}`;
    return url;
};

export const getSpotifyAccessToken = (): string | null => {
    const token = sessionStorage.getItem("spotifyAccessToken");
    const expiryTime = sessionStorage.getItem("spotifyTokenExpiry");

    if (token && expiryTime && new Date().getTime() < parseInt(expiryTime)) {
        return token;
    } else {
        console.error("Spotify access token expired or missing.");
        return null;
    }
};
export const fetchSpotifyUserData = async () => {
    const token = getSpotifyAccessToken();
    if (!token) {
        //throw new Error("Access token is not available.");
        return null;
    }
    const response = await axios.get(`${SPOTIFY_API_BASE_URL}/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    //console.log(response.data);
    return response.data; 
};
