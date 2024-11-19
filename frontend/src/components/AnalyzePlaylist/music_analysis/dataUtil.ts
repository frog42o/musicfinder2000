import axios from 'axios'

export const fetchSongByID = async(accessToken:string, id:any)=>{
  try{
    const response = await axios.get(`https://api.spotify.com/v1/tracks/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });
    return response.data;
  }catch(err){
    console.log(err);
    throw err;
  }
}
export const fetchAPIData = async (url:string, range: number[], accessToken:string,  setProgress: (progress: number) => void) => {
    const [start, end] = range; 
    const rangeSpan = end - start; 
  
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        onDownloadProgress: (progressEvent) => {
          const total = progressEvent.total || 1;
          const loaded = progressEvent.loaded || 0;
  
          const progress = start + Math.min((loaded / total) * rangeSpan, rangeSpan);
          setProgress(progress);
          //console.log(`Progress for ${url}: ${progress}%`);
        },
      });
  
      return response.data; 
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
      throw error;
    }
  };
  export const fetchAudioFeatures = async(accessToken: string, range:number[], ids: string[], setProgress:(progress:number)=> void) =>{
    try{
        const data = ids;
        let remainingIDs = data.length;
        const result:any[] = [];

        while (remainingIDs > 0) {
            const currentBatchSize = Math.min(remainingIDs, 50);
            const currentBatch = data.splice(0, currentBatchSize); 
            const FETCH_AUDIO_FEATURES_URL =`https://api.spotify.com/v1/audio-features?ids=${currentBatch}`;
            try {
               const response = await fetchAPIData(FETCH_AUDIO_FEATURES_URL, range, accessToken, setProgress);
               result.push(...response.audio_features);
            } catch(err){
                console.log(err);
                throw err;
            }
            remainingIDs -= currentBatchSize;
        }
        return result;
    }
    catch(err){
        console.log(err);
        throw err;
    }
}
export const fetchRecommendations = async (
  data: Record<string, number>,
  accessToken: string,
  range: number[],
  artists_ids:string[],
  setProgress: (progress: number) => void
) => {
  if (!accessToken) return [];
  try {
    const features = {
      
      target_danceability: data.danceability,
      target_energy: data.energy,
      target_loudness: data.loudness,
      target_speechiness: data.speechiness,
      target_acousticness: data.acousticness,
      target_instrumentalness: data.instrumentalness,
      target_valence: data.valence,
      target_tempo: data.tempo,
      target_key: data.key,
      target_liveness: data.liveness,
      target_mode: data.mode,
      target_duration_ms: data.duration_ms,
      target_time_signature: data.time_signature,
    };

    const url = `https://api.spotify.com/v1/recommendations?limit=100&seed_artists=${artists_ids}&target_danceability=${features.target_danceability}&
    target_energy=${features.target_energy}&
    target_loudness=${features.target_loudness}&
    target_speechiness=${features.target_speechiness}&
    target_acousticness=${features.target_acousticness}&
    target_instrumentalness=${features.target_instrumentalness}&
    target_valence=${features.target_valence}&
    target_tempo=${features.target_tempo}&
    target_liveness=${features.target_liveness}&
    target_mode=${features.target_mode}&
    target_duration_ms=${features.target_duration_ms}&
    target_time_signature=${features.target_time_signature};`

    const response = await fetchAPIData(url, range, accessToken, setProgress);


    const recommendations = response.tracks.map((track: any) => ({
      id: track.id,
      ...track.audio_features, 
    }));

    return recommendations;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const normalizeAudio = (data: any[]) => {
  const normalize = (value: number, min: number, max: number) => (value - min) / (max - min);

  const normalizedData = data.map((track) => ({
    id: track.id, 
    danceability: normalize(track.danceability, 0, 1),
    energy: normalize(track.energy, 0, 1),
    loudness: normalize(track.loudness, -60, 0),
    speechiness: normalize(track.speechiness, 0, 1),
    acousticness: normalize(track.acousticness, 0, 1),
    instrumentalness: normalize(track.instrumentalness, 0, 1),
    valence: normalize(track.valence, 0, 1),
    tempo: normalize(track.tempo, 50, 200),
    key: normalize(track.key, 0, 11), 
    liveness: normalize(track.liveness, 0, 1),
    mode: track.mode, 
    duration_ms: normalize(track.duration_ms, 60000, 480000), 
    time_signature: normalize(track.time_signature, 3, 7), 
  }));

  return normalizedData;
};

export const findAverageAudioFeature = (audioData: any[]) => {
  const featureKeys = [
    "danceability",
    "energy",
    "loudness",
    "speechiness",
    "acousticness",
    "instrumentalness",
    "valence",
    "tempo",
    "key",
    "liveness",
    "mode",
    "duration_ms",
    "time_signature",
  ];

  const featureSums: Record<string, number> = {};
  featureKeys.forEach((key) => (featureSums[key] = 0));

  audioData.forEach((track) => {
    featureKeys.forEach((key) => {
      featureSums[key] += track[key];
    });
  });

  const featureAverages: Record<string, number> = {};
  featureKeys.forEach((key) => {
    featureAverages[key] = featureSums[key] / audioData.length;
  });

  return featureAverages;
};