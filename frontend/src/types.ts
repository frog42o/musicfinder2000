export interface UserDataProps {
    data: {
        display_name: string;
        email: string;
        images?: { url: string }[];
        id: string;
    };
}

export interface ErrorProps{
    data:{
        message?:string;
    }
}
export interface Playlist{
    id: string;
    name: string;
    description: string;
    tracks: {
        total: number;
    };
    owner:{
        display_name: string;
    };
}
export interface Track {
    id: string;
    name: string;
    popularity: number;
    duration_ms: number;
    album: {
      name: string;
      images: { url: string }[];
    };
    artists: { name: string }[];
  }
export interface Song {
    track: Track;
  }
  
export interface TrackDetailsProps {
    songs: Song[];
    genres: string[]|string[][];
  }