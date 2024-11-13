import React, {useState, useEffect} from 'react';
import { Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/Authorization';
import axios from 'axios';
import { fetchArtistGenre, getTopGenres } from './music_analysis/musicAnalysis';
import Error from '../../components/Error'

const BASE = "https://api.spotify.com/v1/playlists";

const AnalyzePlaylist: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const playlist = location.state?.playlist;

    const [genreLoading, setGenreLoading] = useState<boolean>(true);
    const [genreProgress, setGenreProgress] = useState<number>(0);

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
                const response = await axios.get(`${BASE}/${playlist.id}/tracks`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                //console.log(response.data.items);
                setSongs(response.data.items);
                const fetchGenre = await fetchArtistGenre(accessToken, songs, setGenreProgress);
                const genre_data = getTopGenres(fetchGenre);
                setTopGenres(genre_data);
                setGenreLoading(false);
            }
            catch (err){
                console.log("Error fetching songs: ", err);
            } finally{
                setLoading(false);
            }
        };
        fetchSongs();
    }, [accessToken, songs]);
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
            {genreLoading ? (
                <div className="progress" style={{ height: "30px", width: "100%" }}>
                    <div
                        className="progress-bar progress-bar-striped progress-bar-animated"
                        role="progressbar"
                        style={{ width: `${genreProgress}%` }}
                        aria-valuenow={genreProgress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        {genreProgress}%
                    </div>
                </div>
            ) : (
                <p><strong>Genres: </strong>{topGenres.length > 0? topGenres.join(" / "): "No genres found."}</p>
            )}
           
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