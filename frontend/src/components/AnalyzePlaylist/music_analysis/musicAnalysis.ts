

const BASE = "https://api.spotify.com/v1/artists"


export const fetchArtistGenre = async(accessToken: string, songs: any[], onProgress?: (progress: number) => void ) =>{
    try{
        const genres: Record<string, number> = {}
        const totalSongs = songs.length;
        let processedSongs = 0;
        for(const song of songs){
            const artistIDs =  song.track.artists.map((artist: { id: string }) => artist.id);
            for (const artistId of artistIDs) {
                const response = await fetch(`${BASE}/${artistId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                if (!response.ok) {
                    console.error(`Failed to fetch data for artist ID: ${artistId}`);
                    continue;
                }

                const data = await response.json();
                data.genres.forEach((genre: string) => {
                    genres[genre] = (genres[genre] || 0) + 1;
                });

                processedSongs++;
                if (onProgress) {
                    onProgress(Math.round((processedSongs / totalSongs) * 100));
                }
            }
        }
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