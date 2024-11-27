
import React , {useState, useEffect} from 'react';
import { useAuth } from '../../utils/Authorization';
import axios from 'axios';
import { UserDataProps } from '../../types';
import { useNavigate } from 'react-router-dom';
import MenuBar from '../HomeComponents/MenuBar';
import SpotifyLogout from './SpotifyLogout';

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
            navigate(`/analyze/${selectedPlaylist}`); 
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
            }, 500);
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
            }, 500);
        }
    }
    if (loading) {
        return <p>Loading playlists...</p>;
    }
    
    return (<>
            <div className='playlist-wrapper'>
                <div className={`blur-container p-3 py-1 d-flex flex-column text-center overflow-auto hidden-scrollbar rounded-3 shadow`}  style={{
                    maxHeight:"350px",
                    width:"600px",
                    scrollBehavior: "smooth",
                }}>
                <p className="m-0 p-0 secondary-text" style={{
                        position: "absolute",
                        top: 10,
                        left: 20,
                        zIndex: 10,
                        margin: 0,
                        padding: "1rem",
                        backgroundColor: "rgba(0,0,0,0)",
                        letterSpacing:"2px"
                }}>{selectedPlaylistIndex +1} / {playlists.length} playlists</p>
                {playlists.length > 0 && (
                <div className={`d-block mt-2 rounded-3 mb-2 playlist-container ${animationDirection ? `slide-${animationDirection}` : ""}`} key={playlists[selectedPlaylistIndex].id}>
                    <div className="d-flex flex-column justify-content-center align-items-center text-center">
                        <div className="mt-3 playlist-image">
                            <img className="shadow rounded"src={playlists[selectedPlaylistIndex].images?.[0]?.url || ""} alt={`${playlists[selectedPlaylistIndex].name}'s Cover`}
                            style={{width:"100%"}}/>
                        </div>
                        <div className="playlist-info mt-3">
                        <h6 style={{
                            fontSize: '1rem',
                            margin: 0,
                            }}>{playlists[selectedPlaylistIndex].name}
                        </h6>
                        <div className='d-flex flex-row justify-content-center text-center mt-n5'>
                            <button onClick={handleBack} disabled={selectedPlaylistIndex === 0} className="arrow-button tc-w" >&#8592;</button>
                            <p style={{ fontSize: '0.9rem',textTransform: 'lowercase',}}>
                                Playlist •  {playlists[selectedPlaylistIndex].owner?.display_name || 'Unknown Owner'}
                            <button onClick={handleForward} disabled={selectedPlaylistIndex === playlists.length - 1}className="arrow-button tc-w">&#8594;</button>
                            </p>
                        </div>
                        </div>
                    </div>
                </div>
                )}
                </div>
            </div>
        <div className='d-flex flex-row text-center w-100 gap-3 mt-3 playlist-btn-container ms-auto tc-w'>  
            <MenuBar/>|
            <button onClick = {handleAnalyze} className="playlist-btn w-100 "> Select </button>|
            <SpotifyLogout/>
        </div>
      
    </>);
}

export default FetchPlaylist;