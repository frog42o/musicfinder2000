import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"


const CallBack: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const hash = window.location.hash;
        if(hash){
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get("access_token");
            const expiresIn = params.get("expires_in");
            console.log("Access Token:", accessToken);
            console.log("Expires In:", expiresIn);

            if (accessToken) {
                sessionStorage.setItem("spotifyAccessToken", accessToken);

                if (expiresIn) {
                    const expiryTime = new Date().getTime() + parseInt(expiresIn) * 1000;
                    sessionStorage.setItem("spotifyTokenExpiry", expiryTime.toString());
                }
                window.location.hash = "";
                navigate("/dashboard");
            } else {
                console.error("Authorization failed or no token returned.");
                navigate("/error");
            }
        }
    }, [navigate]);

    return(<><p>Logging in via Spotify...</p></>);
};

export default CallBack;