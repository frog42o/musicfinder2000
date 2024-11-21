
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
    const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState(0);
    const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
    const navigate = useNavigate();
    const [animationDirection, setAnimationDirection] = useState<"forward" | "backward" | null>(null);

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
                setSelectedPlaylist(userPlaylists[0].id); 
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
    const handleBack = () =>{
        if(selectedPlaylistIndex >0){
            setAnimationDirection("backward");
            setTimeout(() => {
                setSelectedPlaylistIndex((prev) => {
                    const newIndex = prev - 1;
                    setSelectedPlaylist(playlists[newIndex].id);
                    return newIndex;
                });
                setAnimationDirection(null);
            }, 300);
        }
    }
    const handleForward = () =>{
        if(selectedPlaylistIndex < playlists.length-1){
            setAnimationDirection("forward");
            setTimeout(() => {
                setSelectedPlaylistIndex((prev) => {
                    const newIndex = prev + 1;
                    setSelectedPlaylist(playlists[newIndex].id);
                    return newIndex;
                });
                setAnimationDirection(null);
            }, 300);
        }
    }
    if (loading) {
        return <p>Loading playlists...</p>;
    }
    
    return (<>
    <h6>Select a playlist to analyze!</h6>
        <div className={`bg-light p-3 py-1 d-flex flex-column text-center overflow-auto hidden-scrollbar border ${animationDirection ? `slide-${animationDirection}` : ""}`}  style={{
            maxHeight:"350px",
            width:"600px",
            scrollBehavior: "smooth",
        }}>
            {playlists.length > 0 && (
            <div
                className={`d-block mt-2 rounded-3 border mb-2`}
                key={playlists[selectedPlaylistIndex].id}
                style={{
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor:'#e9ecef',
                    border:'2px solid #ccc',
                }}>
                <div className="d-flex flex-column justify-content-center text-center">
                    <div className="mt-3 profile-image ">
                        <img className="shadow rounded"src={playlists[selectedPlaylistIndex].images?.[0]?.url || ""} alt={`${playlists[selectedPlaylistIndex].name}'s Cover`}
                        style={{width:"40%"}}/>
                    </div>
                    <div className="playlist-info mt-3">
                    <h6 style={{
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        margin: 0,
                        color: '#333',
                        }}>{playlists[selectedPlaylistIndex].name}
                    </h6>
                    <div className='d-flex flex-row justify-content-center text-center mt-n5'>
                        <button onClick={handleBack} disabled={selectedPlaylistIndex === 0} className="arrow-button">&#8592;</button>
                        <p style={{ fontSize: '0.9rem',color: '#666',textTransform: 'lowercase',}}>
                            Playlist •  {playlists[selectedPlaylistIndex].owner?.display_name || 'Unknown Owner'}
                        <button onClick={handleForward} disabled={selectedPlaylistIndex === playlists.length - 1}className="arrow-button">&#8594;</button>
                        </p>
                    </div>
                    </div>
                </div>
            </div>
            )}
        </div>
    <Button onClick = {handleAnalyze} className="btn btn-dark w-100 d-block mt-1 uppercase-text text-white"> Analyze</Button>
    </>);
}

export default FetchPlaylist;