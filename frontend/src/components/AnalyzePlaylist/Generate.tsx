import React, {useState} from 'react';
import { useAuth } from '../../utils/Authorization';
import { TrackDetailsProps,Track } from '../../types';
import { Button } from 'react-bootstrap';
import Error from '../../components/Error'
import { fetchAPIData, fetchAudioFeatures, fetchRecommendations, fetchSongByID, findAverageAudioFeature, normalizeAudio } from './music_analysis/dataUtil';
import { assignTracksToClusters, filterRecommendationsByCluster, findDominantCluster, kMeansAlgorithm } from './music_analysis/kmeanAnalysis';


const Generate: React.FC<TrackDetailsProps> = ({songs, artists_ids}) =>{
    const {accessToken} = useAuth();
    const [showGenerateModal, setGenerateModal] = useState(false);
    const handleShow = () => setGenerateModal(true);
    const handleHide = () => setGenerateModal(false);

    const [progress, setProgress] = useState(0); // Progress value (0 to 100)
    const [stage, setStage] = useState("");
    const [generateSong, setGenerateSong] = useState(true);
    const [generatePlaylist, setGeneratePlaylist] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [finishedGenerating, setFinishedGenerating] = useState(false);

    const [songData, setSongData] = useState<any | null>(null);


    //HISTORICAL DATA
    const historicalData = {
        topTracks: [],
        recentlyPlayed: [],
        currentPlaylist: songs
      };


    let cleanedData: any[] = [];
    let cleanedDataAudioFeatures: any[] = []; //normalized audio feature for cleanedData
    let userPlaylistAudioFeatures: any[] = []; //normalized userplaylist audio features
    let recommendedSongs:any[] = []; //100 recommend songs based on top genre seeds
    let recommendSongsAudioFeaturesList: any[] = [];

    let filteredRecommendationsList:any[] = [];

    let selectedSong: any = [];
    const stages = ["fetching historical data...", 
        "analyzing audio features...", 
        "running some machine learning algorithms...", 
        generateSong? "recommending new songs...": "generating a new playlist...", 
        "musicfinder2000 has generated something"];

    const handleGenerationChoice = (choice:boolean, type:number)=>{
        if(type == 0){
            setGenerateSong(choice)
            setGeneratePlaylist(!choice);
        }else{
            setGenerateSong(!choice)
            setGeneratePlaylist(choice);
        }
    }
    const handleGenerationProcess = async () => {
        setIsGenerating(true);
        for (let i = 0; i < stages.length; i++) { 
            setStage(stages[i]);
            //split each bar from 100/5 = 20 , then each stage gets to work from (0-20), then (20-40, then (60-80) then 80-> 100 on success to stimulate a live progress bar and not in blocks
            const currentRange = [(i*20), (i+1)*20];
            await handleTask(i, currentRange, generateSong, generatePlaylist);

            await new Promise((resolve) => setTimeout(resolve, 500));
        }
        setIsGenerating(false);
    };
    async function handleTask(stage:number, range:number[], generateSong?:boolean, generatePlaylist?:boolean){
        switch(stage){
            case 0: //get all playlist (user playlist data) 
                return await fetchHistoricalData(range);
            case 1: //prepare historical data by filtering data based on genre,clean data up (duplicates, etc), AUDIO ANALYSIS [20,40]
                if(!accessToken)return;
                
                const[start,end] = range;
                cleanHistoricalData([start, start + (end - start)/4]); //[20,25]
                await analyzeHistoricalData([start + (end - start)/4, end]); //[25,40]
                const audioRecommendData = findAverageAudioFeature(cleanedDataAudioFeatures); //pass the average into recommendations
                recommendedSongs = await fetchRecommendations(audioRecommendData, accessToken, range, artists_ids, setProgress);
                return 1;
            case 2: //train model using preprocessed historical data w k-means clustering; 
                await runMachineLearning(recommendedSongs, range);
                return 1;
            case 3: //choose if its a playlist generation or button
                await musicFinder2000(filteredRecommendationsList, range, generateSong, generatePlaylist);
                return;
            case 4: //display song or playlist information
                setFinishedGenerating(true);
                setIsGenerating(false);
                console.log("Generation process complete!");
                setProgress(100);
                return;
            default:
                return(<Error data={{message:`Invalid Stage ${stage}`}}></Error>);
        }
    }
    const fetchHistoricalData = async(range: number[]) =>{
        const[start,end] = range;
        // fetch user's recently played, and medium-term top tracks as data set for machine learning
        const USER_TOP_TRACKS_URL = `https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50&offset=0`;
        const now = Date.now();
        const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
        const USER_RECENTLY_PLAYED_URL =`https://api.spotify.com/v1/me/player/recently-played?limit=50&after=${oneWeekAgo}`;
        try{
            if(!accessToken){
                return;
            }
            const topTracks = await fetchAPIData(USER_TOP_TRACKS_URL, [start, start + (end - start) / 2], accessToken, setProgress);
            //console.log("Fetched top track!");
            const recentlyPlayed = await fetchAPIData(USER_RECENTLY_PLAYED_URL, [start + (end - start) / 2, end], accessToken, setProgress);

            //console.log("Fetched recently played!");
            historicalData.topTracks = topTracks.items;
            historicalData.recentlyPlayed = recentlyPlayed.items;
           
            return 1;
            
        }
        catch(err){
            console.log(err);
            throw err;
        }

    }
    const cleanHistoricalData = (range:number[]) =>{
        if(!accessToken) return;
        const [start, end] = range;
        let simulatedProgress = start; 
      
        const interval = setInterval(() => {
          if (simulatedProgress < end) {
            simulatedProgress += 1;
            setProgress(Math.min(simulatedProgress, end));
          }
        }, 100); 
        //combine,normalize, filter out duplicates
        const combinedData = [...historicalData.topTracks|| [], ...historicalData.recentlyPlayed|| [], ...historicalData.currentPlaylist|| []];
        const consistentData = combinedData.map((item) => {
            return item.track
              ? item 
              : { track: item as unknown as Track }; 
          });
        
          // Remove duplicates using Map based on track.id
          const removeDuplicateData = Array.from(
            new Map(
                consistentData.map((item) => [item.track.id, item]) 
            ).values()
          );
        cleanedData = removeDuplicateData;
        clearInterval(interval);
        setProgress(end);
        return 1;
    }
    const analyzeHistoricalData = async(range:number[]) =>{ //fetch audio features to be processed range: [25,40]
        if(!accessToken) return;
        const[start,end] = range;
        let simulatedProgress = start; 
        const interval = setInterval(() => {
          if (simulatedProgress < 30) {
            simulatedProgress += 1;
            setProgress(Math.min(simulatedProgress, 30));
          }
        }, Math.floor(Math.random() * (4001)) + 1000); 
        //console.log("cleaned data: ", cleanedData);

        const extractHistoricalDataIds = cleanedData.map((item)=> item.track.id); //gets id from cleaned data
        const _fetchAudioFeatures = await fetchAudioFeatures(accessToken, [30,35], extractHistoricalDataIds, setProgress); //returns a list of audio feature , range[30,40]
        //console.log(_fetchAudioFeatures);
        clearInterval(interval);

        analyzeAudioFeatures(_fetchAudioFeatures, [35,end]);
        return 1;
    }
    const analyzeAudioFeatures = async(audioFeatures:any[], range:number[]) =>{ //FETCH NEW RECOMMEND SONGS (lim =50 in batches) based on top genres, top artist, audio features,etc
        if(!accessToken) return;
        const[start,end] = range;
        let simulatedProgress = start; 
        const interval = setInterval(() => {
          if (simulatedProgress < end) {
            simulatedProgress += 1;
            setProgress(Math.min(simulatedProgress, end));
          }
        }, Math.floor(Math.random() * (451)) + 500); 

        //select audio features from audiofeatures  
        cleanedDataAudioFeatures = normalizeAudio(audioFeatures);
        //find average audio features from user's playlist for ML later
        const user_playlist_ids = historicalData.currentPlaylist.map((item)=>item.track.id);
        const user_audio_features = await fetchAudioFeatures(accessToken, range, user_playlist_ids, setProgress)
        userPlaylistAudioFeatures = normalizeAudio(user_audio_features);
        //get initial list of new recommend songs based on top genre seeds, audio features from normalized user playlist
        clearInterval(interval);
        return 1;
    }
    const runMachineLearning = async(recSongs: any, range:number[])=>{
        if(!accessToken)return;
        const[start,end] = range;
        let simulatedProgress = start; 
        const interval = setInterval(() => {
          if (simulatedProgress < end) {
            simulatedProgress += 1;
            setProgress(Math.min(simulatedProgress, end));
          }
        }, Math.floor(Math.random() * (9001)) + 1000); 
        const model = await kMeansAlgorithm(cleanedDataAudioFeatures, userPlaylistAudioFeatures);
        //assign user playlist to model's clusters
        const userPlaylistCluster = assignTracksToClusters(userPlaylistAudioFeatures, model);
        const dominantCluster = findDominantCluster(userPlaylistCluster);

        //converts songs into array for mapping
        const songsArray = Array.isArray(recSongs) ? recSongs : [recSongs];
        const consistentSongData = songsArray.map((item) => {
            return item.track
                ? item 
                : { track: item as unknown as Track };
        });

        const recommendSongsID = consistentSongData.map((item) => item.track.id);
        //console.log(recommendSongsID);
        const getRecommendSongsAudioFeatures = await fetchAudioFeatures(accessToken, [60,80], recommendSongsID, setProgress);
        recommendSongsAudioFeaturesList = normalizeAudio(getRecommendSongsAudioFeatures);
        
        const _filteredRecommendations = filterRecommendationsByCluster(recommendSongsAudioFeaturesList, model, dominantCluster);
        filteredRecommendationsList = _filteredRecommendations;
        clearInterval(interval);
        return 1;
    }
    const getRandomSong = (arr: any[]): any => {
        if (arr.length === 0) {
          console.log("Array is empty, cannot fetch a random element.");
          return null;
        }
        const randomIndex = Math.floor(Math.random() * arr.length);
        return arr[randomIndex];
      };
    const musicFinder2000 = async(filteredRecommendations:any[], range:number[], generateSong:boolean|undefined, generatePlaylist:boolean|undefined)=>{
        if(!accessToken) return;
        const[start,end] = range;
        let simulatedProgress = start; 
        const interval = setInterval(() => {
          if (simulatedProgress < end) {
            simulatedProgress += 1;
            setProgress(Math.min(simulatedProgress, end));
          }
        }, Math.floor(Math.random() * (9001)) + 1000); 
        if(generateSong){ //fetch first song in filteredRecommendations
            const grabSong = getRandomSong(filteredRecommendations);
            selectedSong = await fetchSongByID(accessToken, grabSong.id);
            //console.log(selectedSong);
            setSongData(selectedSong);
        }else if(generatePlaylist){ //generate 10-20 songs in a playlist and return it
            console.log(filteredRecommendations);
        }
        clearInterval(interval);
    }

    if(!accessToken){
        return(<Error data={{message:"Access Token has expired, please try again!"}}></Error>);
    }

    return (<>
        <Button className='btn btn-success mb-2 mr-2 uppercase-text' onClick = {handleShow} >Generate</Button>
            <div
                className={`modal fade ${showGenerateModal ? "show d-block" : ""}`}
                tabIndex={-1}
                aria-labelledby="staticBackdropLabel"
                aria-hidden={!showGenerateModal}
                style={showGenerateModal ? { backgroundColor: "rgba(0,0,0,0.8)" } : {}}
            >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="staticBackdropLabel">musicfinder2000 Generator</h1>
                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            onClick={handleHide}
                            disabled={isGenerating}
                        ></button>
                    </div>
                    <div className="modal-body">
                        {finishedGenerating? <> 
                        <div className="d-flex gap-2">
                            <p className=''>Generated Song:</p>
                        </div>
                        {songData && <>
                        <div className="bg-secondary-subtle border border-dark  d-flex align-items-center justify-content-start mb-1">
                        <div className='p-2'>
                            <img
                                src={songData.album.images?.[0]?.url || ""}
                                alt={`${songData.name}'s Picture'`}
                                className="circle-profile border border-dark"
                            />
                        </div>
                        <div className= "p-1 ms-2 d-flex flex-column">
                        <p className='primary-text mt-1 mb-0' style={{ textAlign: "left" }}>
                            {songData.name} <span style={{ textTransform: 'lowercase', fontSize: '12px' }}>by: </span>
                            {songData.artists.map((artist: { name: string }) => (
                                <span className='secondary-text mb-0 tc-g' style={{ textAlign: "left" }}>
                                {artist.name} </span>
                                ))}
                            </p>
                        </div>
                        </div>
                        </>}
                        </>:<>
                        <div className="d-flex gap-2">
                        <p className=''>Choose a mode:</p>
                            <Button variant={generateSong ? "success" : "outline-secondary"}
                                className={`btn ${generateSong ? "active" : ""} uppercase-text `}
                                onClick={()=>handleGenerationChoice(!generateSong, 0)}
                                disabled={isGenerating}>
                                Generate Song
                            </Button>
                            <Button
                                variant={generatePlaylist ? "success" : "outline-secondary"}
                                className={`btn ${generatePlaylist ? "active" : ""} uppercase-text`}
                                onClick={()=>handleGenerationChoice(!generatePlaylist, 1)}
                                disabled={isGenerating}>
                                Generate Playlist
                            </Button>
                        </div>
                        <div className='d-flex flex-column align-items-start'>
                        <p className='mb-1' style={{fontSize:"12px"}}>{stage}</p>
                        <div className="progress w-100" role="progressbar" aria-label="Success example" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                            <div className="progress-bar bg-success" style={{width:`${progress}%`}}>{Math.floor(progress)}%</div>
                        </div>
                        </div>
                        </>}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleHide} disabled={isGenerating}>Close</button>
                        {finishedGenerating?<>
                        <button type="button" className='btn btn-primary'>Add to Playlist</button>
                        <button type="button" className='btn btn-success'>Regenerate</button>
                        </>:<>
                        <button type="button" className="btn btn-success"  onClick={handleGenerationProcess} disabled={isGenerating}>{isGenerating? "Generating...": "Go!"}</button>
                        </>}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default Generate;