import React, {useState, useEffect} from 'react';
import { Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/Authorization';
import axios from 'axios';
import { fetchArtistGenre, getTopGenres } from './music_analysis/musicAnalysis';
import Error from '../../components/Error'

const PLAYLIST_URL = "https://api.spotify.com/v1/playlists";
const ARTIST_URL = "https://api.spotify.com/v1/artists"

const AnalyzePlaylist: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const playlist = location.state?.playlist;

    const [genreLoading, setGenreLoading] = useState<boolean>(true);
    //const [genreProgress, setGenreProgress] = useState<number>(0);

    const {accessToken} = useAuth();
    const [loading, setLoading] = useState<boolean>(true);
    const [songs, setSongs] = useState<any[]>([]);
    const [topGenres, setTopGenres] = useState<string[] | string[][]>([]);

    if(!accessToken){
        setLoading(false);
        return (<Error data = {{ message: "Access Token is missing or has expired!"}}/>)
    }
    if (!playlist) {
        return <p>No playlist data available. Please go back and select a playlist.</p>;
    }
    useEffect(()=>{
        const fetchSongs = async() =>{
            try{
                const response = await axios.get(`${PLAYLIST_URL}/${playlist.id}/tracks`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                setSongs(response.data.items);
                //const genres: Record<string, number> = {}

                let artistIDsList = [];

                for(const song of response.data.items){
                    const artistIDs =  song.track.artists.map((artist: { id: string }) => artist.id);
                    for(const id of artistIDs){
                        artistIDsList.push(id);
                    }
                }
                const getArtistIds = artistIDsList.splice(0, 50); 
                try {
                    console.log("current batch: ", getArtistIds);
                    const artist_data = await axios.get(`${ARTIST_URL}?ids=${getArtistIds.join(",")}`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }); 
                    if (artist_data.status === 429) {
                        // Get Retry-After header
                        const retryAfterHeader = artist_data.headers['retry-after'];
                        console.log("lol, ", retryAfterHeader);
                    }
                    console.log(artist_data.data.items);  
                    // response2.data.artist.genres.forEach((genre: string) => {
                    //     genres[genre] = (genres[genre] || 0) + 1;
                    //  });

                } catch(err){
                    console.log(err);
                    throw err;
                }
                console.log("All API calls completed!");
                //console.log("Genres count:", genres);
                setGenreLoading(false);
            }
            catch (err){
                console.log("Error fetching songs: ", err);
            } finally{
                setLoading(false);
            }
        };
        fetchSongs();
    }, [accessToken]);
    if (loading) {
        return <p>Loading songs from playlist <strong>{playlist.name}</strong>...</p>;
    }

    return (<>
        <div>
            <h3>Analyzing Your Playlist: <span className='text-success'>{playlist.name}</span></h3>
            <p><strong>ID:</strong> {playlist.id}</p>
            <p><strong>Owner:</strong> {playlist.owner.display_name}</p>
            <p><strong>Tracks:</strong> {playlist.tracks.total}</p>
            <p><strong>Description:</strong> {playlist.description || 'No description available.'}</p>
        
            <p><strong>Genres: </strong>{topGenres.length > 0? topGenres.join(" / "): "No genres found."}</p>
           
        </div>
        <div className='d-flex flex-column justify-content-start overflow-auto hidden-scrollbar border border-dark ' style={{
            maxHeight:"300px",
        }}>
        {songs.map((song) => (<>
            <div className="bg-secondary-subtle border border-dark  d-flex align-items-center justify-content-start mb-1">
                <div className='p-2'>
                    <img
                        src={song.track.album.images?.[0]?.url || ""}
                        alt={`${song.track.name}'s Picture'`}
                        className="circle-profile border border-dark"
                    />
                </div>
                <div className= "p-1 ms-2 d-flex flex-column" key={song.track.id}>
                    <p className='primary-text mt-1 mb-0' style={{ textAlign: "left" }} >{song.track.name} <span style={{textTransform:'lowercase', fontSize: '12px'}}>by:</span><span className='secondary-text mb-0 tc-g' style={{ textAlign: "left" }} key={song.id}> {song.track.artists.map((artist: { name: any; }) => artist.name).join(", ")}</span></p>
                </div>
            </div>
        </>
        ))}
        </div>
        <div className='d-flex flex-column justify-content-center mt-2'>
            <Button className='btn btn-primary mb-2' onClick = {() => navigate(-1)}>Perform Analysis</Button>
            <Button className='btn btn-secondary' onClick = {() => navigate(-1)}>Back</Button>
        </div>
        </>
    );
};

export default AnalyzePlaylist;