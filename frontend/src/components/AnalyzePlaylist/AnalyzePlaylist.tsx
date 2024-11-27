import React, {useState, useEffect} from 'react';
import { Button, OverlayTrigger, Tooltip,Form } from 'react-bootstrap';
import { NavLink, useParams,useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/Authorization';
import axios from 'axios';
import { fetchArtistData, getArtists, getTopArtistData } from './music_analysis/artistUtil';
import Error from '../../components/Error'
import Generate from './Generate';
import ProgressBar from './ProgressBar';

const PLAYLIST_URL = "https://api.spotify.com/v1/playlists";

const AnalyzePlaylist: React.FC = () => {
    const { playlistId } = useParams<{ playlistId: string }>();
    const navigate = useNavigate();


    const {accessToken} = useAuth();
    const [loading, setLoading] = useState<boolean>(true);
    const [songs, setSongs] = useState<any[]>([]);
    const [topGenres, setTopGenres] = useState<string[] | string[][]>([]);
    const[artistIDs , setArtistIds] = useState<string[]>([]);
    const [artistData, setArtistData] = useState<string[] | string[][]>([]);
    const [playlist, setPlaylist] = useState<any>(null);


    //generation variables
    const [generateProgress, setGenerateProgress] = useState<number>(0);
    const [generateStage, setGenerateStage] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);


    //editing variables 
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        if (!accessToken || !playlistId) return;

        const fetchData = async () => {
            try {
                // Fetch playlist data
                const playlistResponse = await axios.get(`${PLAYLIST_URL}/${playlistId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                setPlaylist(playlistResponse.data);
                setIsPublic(playlistResponse.data.public);

                // Fetch songs in the playlist
                const songsResponse = await axios.get(`${PLAYLIST_URL}/${playlistId}/tracks`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                setSongs(songsResponse.data.items);

                // Process artist data
                const { genres, artistCount } = await fetchArtistData(accessToken, songsResponse.data.items);
                const genreData = getTopArtistData(genres);
                const artistIds = getTopArtistData(artistCount);
                setArtistIds(artistIds);

                const topArtistsData = await getArtists(artistIds, accessToken);

                setTopGenres(genreData);
                setArtistData(topArtistsData);
            } catch (err) {
                console.log('Error fetching data: ', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [accessToken, playlistId]);
    const editPlaylistInfo = () =>{
        setIsEditing(true);
    }
    const cancelEditPlaylistInfo = () =>{
        setIsEditing(false);
    }
    const updatePlaylistInfo = async()=>{
        if(!accessToken){
            return;
        }
        try{
            const payload = {
                name: title || undefined, 
                description: description || undefined,
                public: isPublic
              };
            const response = await axios.put(`https://api.spotify.com/v1/playlists/${playlist.id}`, payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                    },
                }
            );
            if(response.status === 200) {              
                alert('Playlist updated successfully! Changes to profile data is reflected within Spotify immediately, but might take a minute or two in this application.');
                setIsEditing(false);
                setTimeout(() => {
                    window.location.reload(); // Reload the page after the delay
                }, 2000); 
                //reset back to non editing
            }

        }catch(err){
            console.log(err);
            throw err;
        }
    }
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
        <div className='blur-container d-flex align-items-center p-2 py-3 rounded-5 w-100'>
            <div className="me-3 playlist-image mt-1 shadow" style={{width:128, height:128, marginLeft:"2rem"}}>
                   <img src={playlist.images?.[0]?.url || ""} alt={`${playlist.name}'s Cover`} />
            </div>
            <div className="playlist-info mt-3 d-flex flex-row justify-content-center p-2 gap-1">
                <div className='d-flex flex-column text-start w-50'>
                    {isEditing?<>
                    <div className='d-flex flex-row'>
                    <Button className={`secondary-text public-private ${isPublic ? "btn-success" : "btn-error"}`} 
                    variant={isPublic ? "success" : "danger"} onClick={() => setIsPublic((prev) => !prev)}>
                        {isPublic ? "public playlist" : "private playlist"}
                    </Button>
                    </div>
                    <Form.Group controlId="formTitle">
                        <Form.Control
                        type="text"
                        placeholder={playlist.name}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="primary-text text-success m-0 edit-input"
                        style={{
                            maxHeight: "35px",
                        }}
                        />
                    </Form.Group>
                        <Form.Group controlId="formDescription">
                            <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder= {playlist.description}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className=" mt-1 secondary-text edit-textarea" 
                            style={{
                                resize: "vertical",
                                minHeight: "35px",
                                maxHeight: "300px",
                            }}
                            />
                    </Form.Group>
                    <p className='secondary-text'>{playlist.owner.display_name} • {playlist.tracks.total} songs</p>
                    </>:<>
                    <p className = "mb-2"style ={{fontSize: "10px", textAlign:"left", letterSpacing:"2px"}}>{playlist.public? "public": "private"} playlist</p>
                    <h1 className='primary-text text-success m-0'>{playlist.name}</h1>
                    <p className = "secondary-text"style={{fontSize:"12px"}}> {playlist.description || ''}</p>
                    <p className='secondary-text'>{playlist.owner.display_name} • {playlist.tracks.total} songs</p>
                    </>}
                </div>
                <div className='d-flex flex-row text-start w-100' style={{gap:"1rem"}}>
                    <p className="w-100"><span className='primary-text'>Genres: </span><br/><span className='secondary-text'>{topGenres.length > 0? topGenres.join(" • "): "No genres found."}</span></p>   
                    <p className='w-100'><span className='primary-text'>Top Artists: </span> <br/> <span className='secondary-text'></span>{artistData.length > 0? artistData.join(" • "): "No artist data found."}<span/></p>  
                </div>
            </div>         
           
        </div>
        <div className=' mt-3 blur-container d-flex flex-column justify-content-start text-center overflow-auto border border-light' style={{
            width: "100%", 
            maxWidth: "1200px", 
            minWidth: "1000px", 
            maxHeight:"300px",
            margin: "0 auto", 
            flexDirection: "column",
        }}>
        <div className='d-flex flex-row justify-content-start align-items-end w-100 gap-5 mt-3'>
            <p className='primary-text col-1 m-0 '>#</p>
            <p className='primary-text col-1 m-0 text-start '>title</p>
            <p className='primary-text col-4 ps-4 m-0 '>album</p>
            <p className='primary-text col-2 m-0 text-start' style={{maxWidth: "130px"}}>date added</p>
            <p className='primary-text col-2 m-0 text-start ps-5 ' style={{maxWidth: "100px",}}>duration
            </p>
        </div>
        <hr></hr>
        {songs.map((song, index:number) => (<>
            <div className="d-flex flex-row align-items-center justify-content-start w-100 gap-3 text-center" style={{border:"none"}} key={song.track.id}>
                <div className='col-1'>
                    {index +1}
                </div>
                <div className='col-3 d-flex flex-row text-start'>
                    <img
                        src={song.track.album.images?.[0]?.url || ""}
                        alt={`${song.track.name}'s Picture'`}
                        className="circle-profile border border-dark"
                    />
                    <div className= "p-1 ms-2 d-flex flex-column w-100">
                        <p className='primary-text mt-1 m-0 w-100' style={{ textAlign: "left", textTransform:'none', fontSize:"18px"}}>
                        {song.track.name} </p>
                        <span className='secondary-text mb-0 tc-g' style={{ textAlign: "left", textTransform:"none", color:"lightgrey",fontSize:"12px" }}>
                        {song.track.artists.map((artist: { name: string }) => artist.name).join(",")} </span>
                    </div>
                </div>
                <div className='col-3 d-flex flex-column align-items-start ps-5 m-0'>
                    <p>{song.track.album.name}</p>
                </div>
                <div className='col-2 d-flex flex-column align-items-start m-0'>
                    {new Date(song.added_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    })}
                </div>
                <div className='col-2 d-flex flex-column align-items-start ps-3 m-0 '>
                    {`${Math.floor(song.track.duration_ms / 1000 / 60)}:${(Math.floor(song.track.duration_ms / 1000) % 60).toString().padStart(2, '0')}`}
                </div>
            </div>
            <hr></hr>
        </>
        ))}
        </div>
        {isEditing? <>
            <Button className="playlist-btn w-25 mt-3" onClick={updatePlaylistInfo}>Update</Button>
            <Button className="playlist-btn w-25 mt-3" onClick = {cancelEditPlaylistInfo} >Back</Button>
        </>: <> 
        <div className={`mt-3 w-100 gap-3 playlist-btn-container tc-w ${isGenerating? "apply-box-shadow-red": "apply-box-shadow-green"}`}>  
            <div className="col align-self-start">
            <OverlayTrigger placement="top"overlay={<Tooltip>Update your playlist information!</Tooltip>}>
                <Button className="playlist-btn w-100" onClick={editPlaylistInfo} disabled={isGenerating}>Edit Playlist</Button>
            </OverlayTrigger> 
            </div>
            <div className="col align-self-start ">  
                <Generate songs={songs} artists_ids = {artistIDs} playlistID={playlist.id} setGenerateProgress={setGenerateProgress} setGenerateStage={setGenerateStage}
                  setIsGenerating ={setIsGenerating} isGenerating ={isGenerating}/>
              
            </div>
            <div className="col align-self-start">
                <OverlayTrigger placement="top"overlay={<Tooltip>Return back to Dashboard!</Tooltip>}>     
                    <Button className='playlist-btn w-100' onClick = {() => navigate(-1)} disabled={isGenerating}>Back</Button>
                </OverlayTrigger>
            </div>
        </div>
        <ProgressBar progress={generateProgress} label={generateStage}/>
        </>}
        </>
    );
};

export default AnalyzePlaylist;