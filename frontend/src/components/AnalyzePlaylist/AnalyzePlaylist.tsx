import React, {useState, useEffect} from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { NavLink, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/Authorization';
import axios from 'axios';
import { fetchArtistData, getArtists, getTopArtistData } from './music_analysis/artistUtil';
import Error from '../../components/Error'
import EditPlaylistInfo from './EditPlaylistInfo';
import Generate from './Generate';

const PLAYLIST_URL = "https://api.spotify.com/v1/playlists";

const AnalyzePlaylist: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const playlist = location.state?.playlist;


    const {accessToken} = useAuth();
    const [loading, setLoading] = useState<boolean>(true);
    const [songs, setSongs] = useState<any[]>([]);
    const [topGenres, setTopGenres] = useState<string[] | string[][]>([]);
    const[artistIDs , setArtistIds] = useState<string[]>([]);
    const [artistData, setArtistData] = useState<string[] | string[][]>([]);

    useEffect(()=>{
        if (!accessToken || !playlist) return;
        const fetchSongs = async() =>{
            try{
                const response = await axios.get(`${PLAYLIST_URL}/${playlist.id}/tracks`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                setSongs(response.data.items);
                //console.log(response.data.items);
                const {genres, artistCount} = await fetchArtistData(accessToken, response.data.items);
                const genre_data = getTopArtistData(genres);
                const artists_id = getTopArtistData(artistCount);
                setArtistIds(artists_id);
                const top_artists_data = await getArtists(artists_id, accessToken);

                setTopGenres(genre_data);
                setArtistData(top_artists_data);
            }
            catch (err){
                console.log("Error fetching songs: ", err);
            } finally{
                setLoading(false);
            }
        };
        fetchSongs();
    }, []);
    if(!accessToken){
        return (<Error data = {{ message: "Access Token is missing or has expired!"}}/>);
    }
    if (!playlist) {
        return (<Error data = {{ message: "No playlist data available. Please go back and select a playlist."}}/>);
    }
    if (loading) {
        return (<>
        <p className='tc-w'>Loading songs from playlist <strong>{playlist.name}</strong>...</p>
        <NavLink to = "/dashboard">Taking too long? Return to the Dashboard.</NavLink>
        </>);
    }
    if (!accessToken) {
        return (
            <div>
                <p>Access Token is missing or has expired!</p>
                <button onClick={() => navigate("/")}>Go to Home</button>
            </div>
        );
    }

    return (<>
        <div className='container-md blur-container d-flex align-items-center p-2 py-3'>
            <div className="me-3 playlist-image mt-1 shadow">
                   <img src={playlist.images?.[0]?.url || ""} alt={`${playlist.name}'s Cover`} />
            </div>
            <div className="playlist-info mt-3 d-flex flex-row justify-content-center p-2 gap-">
                <div className='d-flex flex-column text-start w-50'>
                    <p style ={{fontSize: "10px", fontWeight:"600", textAlign:"left", letterSpacing:"2px"}}>{playlist.public? "public": "private"} playlist</p>
                    <h1 className='primary-text'>Playlist: <span className='text-success mb-3'>{playlist.name}</span></h1>
                    <p className = "mt-1 secondary-text"style={{fontSize:"12px"}}> {playlist.description || ''}</p>
                    <p className='secondary-text'>{playlist.owner.display_name} • {playlist.tracks.total} songs</p>
                </div>
                <div className='d-flex flex-row text-start w-100' style={{gap:"1rem"}}>
                    <p className="w-100"><span className='primary-text'>Genres: </span><br/><span className='secondary-text'>{topGenres.length > 0? topGenres.join(" • "): "No genres found."}</span></p>   
                    <p className='w-100'><span className='primary-text'>Top Artists: </span> <br/> <span className='secondary-text'></span>{artistData.length > 0? artistData.join(" • "): "No artist data found."}<span/></p>  
                </div>
            </div>         
           
        </div>
        <div className=' mt-3 blur-container d-flex flex-column justify-content-start overflow-auto hidden-scrollbar border border-light' style={{
            maxHeight:"300px",
        }}>
        {songs.map((song) => (<>
            <div className="d-flex align-items-center justify-content-start py-1" style={{border:"none"}} key={song.track.id}>
                <div className='p-2'>
                    <img
                        src={song.track.album.images?.[0]?.url || ""}
                        alt={`${song.track.name}'s Picture'`}
                        className="circle-profile border border-dark"
                    />
                </div>
                <div className= "p-1 ms-2 d-flex flex-column">
                <p className='primary-text mt-1 mb-0' style={{ textAlign: "left", textTransform:'none' }}>
                    {song.track.name} <span style={{ textTransform: 'lowercase', fontSize: '12px' }}>by: </span>
                    {song.track.artists.map((artist: { name: string }, index: number) => (
                        <span className='secondary-text mb-0 tc-g' style={{ textAlign: "left" }} key={`${artist.name}-${index}`}>
                        {artist.name} </span>
                        ))}
                </p>
                </div>
            </div>
            <hr></hr>
        </>
        ))}
        </div>
        <div className='mt-3 w-100 gap-3 playlist-btn-container tc-w'>  
            <div className="col align-self-start">
                <EditPlaylistInfo playlist={playlist}/>
            </div>
            <div className="col align-self-start ">  
                <Generate songs={songs} artists_ids = {artistIDs} playlist={playlist}/>
            </div>
            <div className="col align-self-start">
                <OverlayTrigger placement="top"overlay={<Tooltip>Return back to Dashboard!</Tooltip>}>     
                    <Button className='playlist-btn w-100' onClick = {() => navigate(-1)}>Back</Button>
                </OverlayTrigger>
            </div>
        </div>
        </>
    );
};

export default AnalyzePlaylist;