import { getSpotifyAuthUrl } from "../../utils/spotifyAuth";
import { Button } from "react-bootstrap";
import React from 'react'


const SpotifyLogin: React.FC = () => {

    const spotifyLogin = () =>{
        window.location.href = getSpotifyAuthUrl();
    }
    return (
        <Button className="btn btn-success uppercase-text d-block mt-1 w-100 text-white" onClick={spotifyLogin}>
             <img 
                className="mb-1"
                src="https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png" 
                alt="Spotify Logo" 
                style={{ width: "20px", height: "20px", marginRight: "10px" }} 
            />
            Sign in with Spotify</Button>
    );
}

export default SpotifyLogin