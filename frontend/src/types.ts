export interface UserDataProps {
    data: {
        followers: any;
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
    artists: { id: string; name: string }[];
  }
export interface Song {
    track: Track;
  }
  
export interface TrackDetailsProps {
    songs: Song[];
    artists_ids: string[];
    playlistID: string;
    setGenerateProgress: (value: number) => void;
    setGenerateStage: (value:string) =>void;
    setIsGenerating: (value:boolean) =>void;
    isGenerating : boolean;
  }