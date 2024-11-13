
import React , {useState, useEffect} from 'react';
import { useAuth } from '../../utils/Authorization';
import axios from 'axios';
import { UserDataProps } from '../../types';

const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1/users";


const FetchPlaylist: React.FC<UserDataProps> = ({ data }) =>{
    const {accessToken} = useAuth();
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
        const fetchPlaylists = async () =>{
            if(!accessToken){
                setLoading(false);
                throw new Error("Token is not available!");
            }
            //fetch playlist
            try{
                const response = await axios.get(`${SPOTIFY_API_BASE_URL}/${data.id}/playlists?offset=0&limit=5&locale=en-US`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                setPlaylists(response.data.items); //store data within playlists
                setLoading(false);
            } 
            catch (err){
                console.error("Error fetching playlists:", err);
                setLoading(false);
            }
        };
        fetchPlaylists();

    }, [accessToken, data.id]);

    if (loading) {
        return <p>Loading playlists...</p>;
    }
    return (<>
        <div>
            <ul>
                {playlists.map((playlist) => (
                     <li key={playlist.id}>{playlist.name}</li>
                    ))}
            </ul>
        </div>
    </>);
}

export default FetchPlaylist;