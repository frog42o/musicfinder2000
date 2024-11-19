
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
    console.log(playlists);
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
               <Button
               onClick={() => setSelectedPlaylist(playlist.id)}
               className={`d-block mt-2 rounded-3`}
               key={playlist.id}
               style={{
                 textAlign: 'left',
                 padding: '0.5rem',
                 display: 'flex',
                 alignItems: 'center',
                 backgroundColor: selectedPlaylist === playlist.id ? 'rgba(15, 235, 12,0.4)' : '#e9ecef',
                 color: selectedPlaylist === playlist.id ? '#ffffff' : 'rgb(0,0,0)', //doesnt work
                 boxShadow: selectedPlaylist === playlist.id ? "rgb(11, 237, 7) 0px 3px 6px 0px" : "none",
                 border: selectedPlaylist === playlist.id ? '2px solid #119c10' : '2px solid #ccc',
               }}
             >
               <div className="d-flex align-items-center">
                 <div
                   className="me-3"
                   style={{
                     height: '64px',
                     width: '64px',
                     borderRadius: '8px',
                     overflow: 'hidden',
                   }}
                 >
                   <img
                     src={playlist.images?.[0]?.url || ""}
                     alt={`${playlist.name}'s Cover`}
                     style={{
                       height: '100%',
                       width: '100%',
                       objectFit: 'cover',
                       borderRadius: '8px',
                     }}
                   />
                 </div>
                 <div className="playlist-info">
                   <h6
                     style={{
                       fontSize: '1rem',
                       fontWeight: 'bold',
                       margin: 0,
                       color: selectedPlaylist === playlist.id ? '#007bff' : '#333',
                     }}
                   >
                     {playlist.name}
                   </h6>
                   <p
                     style={{
                       fontSize: '0.9rem',
                       color: selectedPlaylist === playlist.id ? '#007bff' : '#666',
                       margin: 0,
                       textTransform: 'lowercase',
                     }}
                   >
                     {playlist.owner?.display_name || 'Unknown Owner'}
                   </p>
                 </div>
               </div>
             </Button>
                ))}
        </div>
        <Button onClick = {handleAnalyze} className="btn btn-dark w-100 d-block mt-1 uppercase-text text-white"> Analyze</Button>
    </>);
}

export default FetchPlaylist;