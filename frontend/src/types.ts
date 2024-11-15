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