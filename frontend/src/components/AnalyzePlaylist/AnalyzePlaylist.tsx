import React, {useState, useEffect} from 'react';
import { Button } from 'react-bootstrap';
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
        <p>Loading songs from playlist <strong>{playlist.name}</strong>...</p>
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
        <div>
            <h3>Analyzing Your Playlist: <span className='text-success'>{playlist.name}</span></h3>
            <p><strong>ID:</strong> {playlist.id}</p>
            <p><strong>Owner:</strong> {playlist.owner.display_name}</p>
            <p><strong>Tracks:</strong> {playlist.tracks.total}</p>
            <p><strong>Description:</strong> {playlist.description || 'No description available.'}</p>
            <p><strong>Genres: </strong>{topGenres.length > 0? topGenres.join(" / "): "No genres found."}</p>   
            <p><strong>Top Artists: </strong>{artistData.length > 0? artistData.join(" / "): "No artist data found."}</p>           
           
        </div>
        <div className='d-flex flex-column justify-content-start overflow-auto hidden-scrollbar border border-dark ' style={{
            maxHeight:"300px",
        }}>
        {songs.map((song) => (<>
            <div className="bg-secondary-subtle border border-dark  d-flex align-items-center justify-content-start mb-1" key={song.track.id}>
                <div className='p-2'>
                    <img
                        src={song.track.album.images?.[0]?.url || ""}
                        alt={`${song.track.name}'s Picture'`}
                        className="circle-profile border border-dark"
                    />
                </div>
                <div className= "p-1 ms-2 d-flex flex-column">
                <p className='primary-text mt-1 mb-0' style={{ textAlign: "left" }}>
                    {song.track.name} <span style={{ textTransform: 'lowercase', fontSize: '12px' }}>by: </span>
                    {song.track.artists.map((artist: { name: string }, index: number) => (
                        <span className='secondary-text mb-0 tc-g' style={{ textAlign: "left" }} key={`${artist.name}-${index}`}>
                        {artist.name} </span>
                        ))}
                    </p>
                </div>
            </div>
        </>
        ))}
        </div>
        <div className="container text-center mt-2">
            <div className="row">
                <div className="col align-self-start">
                    <EditPlaylistInfo playlist={playlist}/>
                    <p>Update your playlist information!</p>
                </div>
                <div className="col align-self-start ">
                    <Generate songs={songs} artists_ids = {artistIDs}/>
                    <p>Recommends songs & generates playlists based on audio analysis, ML, and AI algorithms!</p>
                </div>
                <div className="col align-self-start">
                    <Button className='btn btn-secondary mb-2 uppercase-text' onClick = {() => navigate(-1)}>Back</Button>
                    <p>Return back to Dashboard!</p>
                </div>
            </div>
        </div>
        <div className='d-flex flex-column justify-content-center mt-2'>
            
            
        </div>
        </>
    );
};

export default AnalyzePlaylist;