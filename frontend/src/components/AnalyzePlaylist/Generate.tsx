// Import statements
import React, { useRef, useState } from 'react';
import { useAuth } from '../../utils/Authorization';
import { TrackDetailsProps, Track } from '../../types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Error from '../../components/Error';
import {
  addSongToPlaylist,
  fetchAPIData,
  fetchAudioFeatures,
  fetchRecommendations,
  fetchSongByID,
  findAverageAudioFeature,
  normalizeAudio,
} from './music_analysis/dataUtil';
import {
  assignTracksToClusters,
  filterRecommendationsByCluster,
  findDominantCluster,
  kMeansAlgorithm,
} from './music_analysis/kmeanAnalysis';

const Generate: React.FC<TrackDetailsProps> = ({ songs, artists_ids, playlistID, setGenerateProgress, setGenerateStage, setIsGenerating, isGenerating }) => {
  // Authentication
  const { accessToken } = useAuth();

  // Generation process states


  const [finishedGenerating, setFinishedGenerating] = useState(false);

  // Generated song data
  const [songData, setSongData] = useState<any | null>(null);

  // Audio playback
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleHide = () => {
    setFinishedGenerating(false);
    setGenerateProgress(0);//reset progress
    setGenerateStage("");
    setIsGenerating(false);
    if (audioRef.current) {
      audioRef.current.pause();
      }
    
  }
  // Handle play/pause of the song preview
  const togglePlayPause = () => {
    if (!songData?.preview_url) {
      console.log('Preview URL not available');
      return;
    }

    if (!audioRef.current || audioRef.current.src !== songData.preview_url) {
        if (audioRef.current) {
        audioRef.current.pause();
        }
        audioRef.current = new Audio(songData.preview_url);
    }

    if (isPlayingPreview) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlayingPreview(!isPlayingPreview);
  };

  // Historical data
  const historicalData = {
    topTracks: [],
    recentlyPlayed: [],
    currentPlaylist: songs,
  };

  // Data variables
  let cleanedData: any[] = [];
  let cleanedDataAudioFeatures: any[] = [];
  let userPlaylistAudioFeatures: any[] = [];
  let recommendedSongs: any[] = [];
  let recommendSongsAudioFeaturesList: any[] = [];
  const filteredRecommendationsList = useRef<any[]>([]);
  let selectedSong: any = null;

  // Stages of the generation process with custom progress ranges
  const stages = [
    { description: 'Fetching historical data...', range: [0, 15] },
    { description: 'Analyzing audio features...', range: [15, 40] },
    { description: 'Running machine learning algorithms...', range: [40, 70] },
    { description:  'Recommending new songs...', range: [70, 90]},
    { description: 'Finalizing the generation...', range: [90, 100] },
  ];

  const handleGenerationProcess = async () => {
    if (!accessToken) return;
  
    setIsGenerating(true); 
    setFinishedGenerating(false); 
  
    for (let i = 0; i < stages.length; i++) {
      const currentStage = stages[i];
      setGenerateStage(currentStage.description);
  
      await handleTask(i, currentStage.range);
  
      // Simulate delay between stages
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setGenerateProgress(100);
    await new Promise((resolve) => setTimeout(resolve, 500)); 
  
    // Show modal only after generation completes
    setIsGenerating(false);
    setFinishedGenerating(true);
    console.log('Generation process complete!');
  };
  
  // Handle each task based on the current stage
  async function handleTask(stageIndex: number, range: number[]) {
    switch (stageIndex) {
      case 0:
        await fetchHistoricalData(range);
        break;
      case 1:
        await prepareAndAnalyzeData(range);
        break;
      case 2:
        await runMachineLearning(range);
        break;
      case 3:
        await generateRecommendations(range);
        break;
      case 4:
        // Final stage - can perform any cleanup if necessary
        break;
      default:
        console.error(`Invalid Stage ${stageIndex}`);
        break;
    }
  }

  // Fetch historical data
  const fetchHistoricalData = async (range: number[]) => {
    const [start, end] = range;
    const USER_TOP_TRACKS_URL = `https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50&offset=0`;
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const USER_RECENTLY_PLAYED_URL = `https://api.spotify.com/v1/me/player/recently-played?limit=50&after=${oneWeekAgo}`;

    try {
      const topTracks = await fetchAPIData(
        USER_TOP_TRACKS_URL,
        [start, start + (end - start) / 2],
        accessToken,
        setGenerateProgress
      );

      const recentlyPlayed = await fetchAPIData(
        USER_RECENTLY_PLAYED_URL,
        [start + (end - start) / 2, end],
        accessToken,
        setGenerateProgress
      );

      historicalData.topTracks = topTracks.items;
      historicalData.recentlyPlayed = recentlyPlayed.items;
    } catch (err) {
      console.error('Error fetching historical data:', err);
    }
  };

  // Prepare and analyze data
  const prepareAndAnalyzeData = async (range: number[]) => {
    const [start, end] = range;
    const midPoint = start + ((end - start) * 1) / 3;
    const endPoint = start + ((end - start) * 2) / 3;

    console.log("Calling cleanHistoricalData...");
    cleanHistoricalData([start, midPoint]);
    console.log("Calling analyzeHistoricalData...");
    await analyzeHistoricalData([midPoint, endPoint]);
    console.log("Calling fetchUserPlaylistAudioFeatures...");
    await fetchUserPlaylistAudioFeatures([endPoint, end]);
  };

  // Clean historical data
  const cleanHistoricalData = (range: number[]) => {
    const [start, end] = range;
    simulateProgress(start, end);

    const combinedData = [
      ...historicalData.topTracks || [],
      ...historicalData.recentlyPlayed || [],
      ...historicalData.currentPlaylist || [],
    ];

    const consistentData = combinedData.map((item) => {
      return item.track ? item : { track: item as unknown as Track };
    });

    // Remove duplicates based on track.id
    const removeDuplicateData = Array.from(
      new Map(consistentData.map((item) => [item.track.id, item])).values()
    );

    cleanedData = removeDuplicateData;
    setGenerateProgress(end);
  };

  // Analyze historical data
  const analyzeHistoricalData = async (range: number[]) => {
    if(!accessToken)return;
    const [start, end] = range;
    simulateProgress(start, end);

    const extractHistoricalDataIds = cleanedData
    .map((item) => item.track?.id) 
    .filter((id) => id !== null && id !== undefined); 
    if (extractHistoricalDataIds.length === 0) {
      console.error("No valid track IDs available after filtering.");
      return;
    }
    try{
      const audioFeatures = await fetchAudioFeatures(accessToken,range,extractHistoricalDataIds, setGenerateProgress);
      cleanedDataAudioFeatures = normalizeAudio(audioFeatures);
    }catch(err){
      console.log(err);
      throw err;
    }
  };

  // Fetch user's playlist audio features
  const fetchUserPlaylistAudioFeatures = async (range: number[]) => {
    if (!accessToken) {
      console.error("Access token is missing in fetchUserPlaylistAudioFeatures");
      return;
    }
    console.log(`Access token in fetchUserPlaylistAudioFeatures: ${accessToken}`);
    const [start, end] = range;
    simulateProgress(start, end);

    const userPlaylistIds = historicalData.currentPlaylist.map(
      (item) => item.track.id
    );
    const userAudioFeatures = await fetchAudioFeatures(
      accessToken,
      range,
      userPlaylistIds,
      setGenerateProgress
    );

    userPlaylistAudioFeatures = normalizeAudio(userAudioFeatures);
  };

  // Run machine learning algorithms
  const runMachineLearning = async (range: number[]) => {
    const [start, end] = range;
    simulateProgress(start, end);

    const audioRecommendData = findAverageAudioFeature(cleanedDataAudioFeatures);
    recommendedSongs = await fetchRecommendations(
      audioRecommendData,
      accessToken,
      range,
      artists_ids,
      setGenerateProgress
    );

    const model = await kMeansAlgorithm(cleanedDataAudioFeatures);

    const userPlaylistCluster = assignTracksToClusters(
      userPlaylistAudioFeatures,
      model
    );
    const dominantCluster = findDominantCluster(userPlaylistCluster);

    const songsArray = Array.isArray(recommendedSongs)
      ? recommendedSongs
      : [recommendedSongs];

    const consistentSongData = songsArray.map((item) => {
      return item.track ? item : { track: item as unknown as Track };
    });

    const recommendSongsID = consistentSongData.map((item) => item.track.id);

    const recommendSongsAudioFeatures = await fetchAudioFeatures(
      accessToken,
      range,
      recommendSongsID,
      setGenerateProgress
    );

    recommendSongsAudioFeaturesList = normalizeAudio(recommendSongsAudioFeatures);

    filteredRecommendationsList.current = filterRecommendationsByCluster(
      recommendSongsAudioFeaturesList,
      model,
      dominantCluster
    );
  };

  // Generate recommendations
  const generateRecommendations = async (range: number[]) => {
    const [start, end] = range;
    simulateProgress(start, end);
    const grabSong = getRandomSong(filteredRecommendationsList.current);
    if (grabSong) {
        selectedSong = await fetchSongByID(accessToken, grabSong.id);
        setSongData(selectedSong);
    } else {
        console.error('No songs available in filtered recommendations.');
      }
  };

  const simulateProgress = (start: number, end: number) => {
    let simulatedProgress = start;
  
    const interval = setInterval(() => {
      simulatedProgress += 1;
  
      if (simulatedProgress <= end) {
        setGenerateProgress(simulatedProgress);
      } else {
        clearInterval(interval);
      }
    }, 50); 
  };
  // Get a random song from an array
  const getRandomSong = (arr: any[]): any => {
    if (arr.length === 0) {
      console.log('Array is empty, cannot fetch a random element.');
      return null;
    }
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
  };

  // Add the generated song to the playlist
  const addToPlaylist = async () => {
    if (!songData || !playlistID) {
      console.log('Playlist or generated song data is not available!');
      return;
    }
    if (!accessToken) return;
    try {
      const response = await addSongToPlaylist(accessToken, playlistID, songData.uri);
      if (response) {
        alert(`Successfully added ${songData.name} to your playlist!`);
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Regenerate a new song
  const regenerate = async () => {
    if (!accessToken) return;
    if (filteredRecommendationsList.current.length === 0) {
      console.error('No recommendations available to regenerate a song.');
      alert('No recommendations available. Please generate recommendations first.');
      return;
    }
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null; // Reset audioRef
      }
      setIsPlayingPreview(false); // Reset playback state
    const newSong = getRandomSong(filteredRecommendationsList.current);
    if (newSong) {
      selectedSong = await fetchSongByID(accessToken, newSong.id);
      setSongData(selectedSong);
    } else {
      console.error('Failed to get a new song.');
    }
  };

  if (!accessToken) {
    return <Error data={{ message: 'Access Token has expired, please try again!' }} />;
  }

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip>
            Recommends songs & generates playlists based on audio analysis, ML, and AI
            algorithms!
          </Tooltip>
        }
      >
        <button
          className="playlist-btn w-100"
          onClick={handleGenerationProcess}
          disabled={isGenerating} 
        >
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>
      </OverlayTrigger>

      {finishedGenerating && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          aria-labelledby="staticBackdropLabel"
          aria-hidden="false"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
        >
          <div className="tc-b modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="staticBackdropLabel">
                  musicfinder2000 found an epic song!
                </h1>
               
                <button type="button" className="btn-close" aria-label="Close" onClick={handleHide}></button>
              </div>
              <div className="modal-body">
              <img 
                src="https://developer.spotify.com/images/guidelines/design/full-logo-framed.svg" 
                alt="Spotify Logo" 
                style={{ width: "100px", height: "100px",  position: "absolute",top: -30, left: 0, zIndex: 10,margin: 0, }} />
                {songData && (
                  <div className="bg-secondary-subtle border border-dark d-flex align-items-center justify-content-start mb-1">
                    <div className="p-2">
                      <img
                        src={songData.album.images?.[0]?.url || ''}
                        alt={`${songData.name}'s Picture'`}
                        className="circle-profile border border-dark"
                      />
                    </div>
                    <div className="p-1 ms-2 d-flex flex-column">
                      <p className="primary-text mt-1 mb-0" style={{ textAlign: 'left' }}>
                        {songData.name}{' '}
                        <span style={{ textTransform: 'lowercase', fontSize: '12px' }}>
                          by:{' '}
                        </span>
                        {songData.artists.map((artist: { name: string }) => (
                          <span
                            key={artist.name}
                            className="secondary-text mb-0 tc-g"
                            style={{ textAlign: 'left' }}
                          >
                            {artist.name}{' '}
                          </span>
                        ))}
                      </p>
                    </div>
                    <label className="preview-container">
                        <input type="checkbox" className="checked" onChange={togglePlayPause}/>
                            <svg className="play" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512">
                                <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"></path>
                                </svg>
                                <svg className="pause"xmlns="http://www.w3.org/2000/svg"height="1em"viewBox="0 0 320 512">
                                <path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"></path>
                            </svg>
                        </label>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <div className='d-flex flex-row justify-content-center align-items-start w-100'>
                  <button type="button" className="playlist-btn w-100" onClick={handleHide} disabled={isGenerating}>Close</button>
                  <button type="button" className='playlist-btn w-100' onClick={addToPlaylist}>Add to Playlist</button>
                  <button type="button" className='playlist-btn w-100' onClick={regenerate}>Regenerate</button>
                </div> 
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Generate;