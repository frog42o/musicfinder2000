import React, {useState, useEffect} from 'react'
import { fetchSpotifyUserData } from '../../utils/spotifyAuth';
import UserData from './UserData';
import SpotifyLogout from './SpotifyLogout';
import MenuBar from '../HomeComponents/MenuBar';

const Dashboard:React.FC = () => {
    const [userData, setUserData] = useState<any>(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchSpotifyUserData();
                setUserData(data);
            } catch (error) {
                console.error("Error fetching user data:", error);
                setUserData(null);
            }
        };
        fetchData();
    }, []);
    return (<>{
        userData? (<>
        <h3>musicfinder2000</h3>
        <UserData data = {userData}/>
        <MenuBar/>
        <SpotifyLogout/>
        </>
    ):(
        <p>Dashboard</p>)}
    </>);
}

export default Dashboard;