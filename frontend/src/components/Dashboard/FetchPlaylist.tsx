
import React , {useState, useEffect} from 'react';
import { useAuth } from '../../utils/Authorization';
import axios from 'axios';
import { UserDataProps } from '../../types';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1/users";


const FetchPlaylist: React.FC<UserDataProps> = ({ data }) =>{
    const {accessToken} = useAuth();
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchPlaylists = async () =>{
            if(!accessToken){
                setLoading(false);
                throw new Error("Token is not available!");
            }
            //fetch playlist
            try{
                const response = await axios.get(`${SPOTIFY_API_BASE_URL}/${data.id}/playlists?offset=0&limit=50&locale=en-US`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                const userPlaylists = response.data.items.filter((playlist: any) => playlist.owner.id === data.id);
                setPlaylists(userPlaylists); //store data within playlists
                setLoading(false);
            } 
            catch (err){
                console.error("Error fetching playlists:", err);
                setLoading(false);
            }
        };
        fetchPlaylists();

    }, [accessToken, data.id]);
    const handleAnalyze = () =>{
        if(selectedPlaylist){
            const playlistData =  playlists.find((p) => p.id === selectedPlaylist);
            navigate('/analyze', { state: { playlist: playlistData } }); 
        }else{
            alert("Please select a playlist to analyze.");
        }
    }
    if (loading) {
        return <p>Loading playlists...</p>;
    }
    return (<>
    <h3>Select a playlist to analyze!</h3>
        <div className='bg-light p-2 py-1 d-flex flex-column justify-content-start overflow-auto hidden-scrollbar border'  style={{
            maxHeight:"300px",
            scrollBehavior: "smooth",
        }}>
            {playlists.map((playlist) => (
                    <Button onClick={() => setSelectedPlaylist(playlist.id)}
                    className={`btn d-block mt-1  ${selectedPlaylist === playlist.id ? 'btn-primary' : 'btn-danger'}`} 
                    key = {playlist.id}>{playlist.name}</Button>
                ))}
        </div>
        <Button onClick = {handleAnalyze} className="btn btn-dark w-100 d-block mt-1 uppercase-text text-white"> Analyze</Button>
    </>);
}

export default FetchPlaylist;