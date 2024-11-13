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