
import axios from 'axios'
const BASE = "https://api.spotify.com/v1/artists"

async function fetchData(artistIds: any[], accessToken: string) {
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


export const fetchArtistGenre = async(accessToken: string, songs: any[] ) =>{
    try{
        const genres: Record<string, number> = {}

        let artistIDsList = [];

        for(const song of songs){
            const artistIDs =  song.track.artists.map((artist: { id: string }) => artist.id);
            for(const id of artistIDs){
                artistIDsList.push(id);
            }
        }

        let remainingArtist = artistIDsList.length;
        (async () => {
            while (remainingArtist > 0) {
            const currentBatchSize = Math.min(remainingArtist, 50);
            const getArtistIds = artistIDsList.splice(0, currentBatchSize); 
            try {
                console.log("current batch: ", getArtistIds);
                const response = await fetchData(getArtistIds, accessToken);

                if(response && response.artist){
                    response.artist.genres.forEach((genre: string) => {
                        genres[genre] = (genres[genre] || 0) + 1;
                    });
                }
            } catch(err){
                console.log(err);
                throw err;
            }
            remainingArtist -= currentBatchSize;
            }
            console.log("All API calls completed!");
            console.log("Genres count:", genres);
        })();
        return genres;
    }
    catch(err){
        console.log(err);
        throw err;
    }
}
export const getTopGenres = (genres: Record<string, number>) => {
    const sortedGenres = Object.entries(genres).sort((a, b) => b[1] - a[1]);
    console.log(sortedGenres);
    if (sortedGenres.length < 3) {
        return [sortedGenres[0][0]];
    }

    const [top1, top2, top3] = sortedGenres;

    const topGenres = [top1[0], top2[0], top3[0]]; // picck top 2 only if dominance isn't clear
    return topGenres;
};