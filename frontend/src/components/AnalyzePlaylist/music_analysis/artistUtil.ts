
import axios from 'axios'
const BASE = "https://api.spotify.com/v1/artists"

async function fetchArtistDataByIds(artistIds: any[], accessToken: string) {
    try{
        const url = `${BASE}?ids=${artistIds.join(",")}`;
        const options = {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        };
        const response = await axios.get(url, options);
        return response.data;

    } catch (err){
        console.log(err);
        throw err;
    }
}
export const fetchArtistData = async(accessToken: string, songs: any[] ) =>{
    try{
        const genres: Record<string, number> = {}
        const artistCount: Record<string, number> = {}; // To store artist counts
        let artistIDsList = [];

        for(const song of songs){
            const artistIDs =  song.track.artists.map((artist: { id: string }) => artist.id);
            for(const id of artistIDs){
                artistIDsList.push(id);
                artistCount[id] = (artistCount[id] || 0) + 1;
            }
        }

        let remainingArtist = artistIDsList.length;
        while (remainingArtist > 0) {
            const currentBatchSize = Math.min(remainingArtist, 50);
            const getArtistIds = artistIDsList.splice(0, currentBatchSize); 
            try {
                // /console.log("current batch: ", getArtistIds);
                const response = await fetchArtistDataByIds(getArtistIds, accessToken);

                if(response){
                    response.artists.forEach((artist: { genres: string[] }) => {
                        artist.genres.forEach((genre: string) => {
                            genres[genre] = (genres[genre] || 0) + 1; 
                        });
                    });
                }
            } catch(err){
                console.log(err);
                throw err;
            }
            remainingArtist -= currentBatchSize;
        }
            //console.log("Genres count:", genres);
        return {genres,artistCount};
    }
    catch(err){
        console.log(err);
        throw err;
    }
}
export const getTopArtistData = (data: Record<string, number>) => {
    try{
        const sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);

         if (sortedData.length === 0) {
            console.error("No genres to sort");
            return [];  
        }
        if (sortedData.length < 3) {
            return sortedData.map(([item]) => item); // Return all if less than 3
        }


        const [top1, top2, top3] = sortedData;

        const topGenres = [top1[0], top2[0], top3[0]];
        return topGenres;
    }
    catch(err){
        console.log("error: ", err);
        throw err;
    }
};
export const getArtists = async(artistData:string[], accessToken:string)=>{
    try {
        const response = await fetchArtistDataByIds(artistData, accessToken);;
        const artistNames = response.artists.map((artist: { name: string }) => artist.name);
        return artistNames;
    } catch(err){
        console.log(err);
        throw err;
    }
}
