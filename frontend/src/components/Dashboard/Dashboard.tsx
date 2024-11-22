import React, {useState, useEffect} from 'react'
import { fetchSpotifyUserData } from '../../utils/spotifyAuth';
import UserData from './UserData';
import Error from '../../components/Error'
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
        <div className='tc-w mb-5 primary-text text-start'>
            <h5 style={{marginLeft:"12px"}}>musicfinder2000</h5>
            <UserData data = {userData}/>
        </div>
        </>
    ):(
        <Error data={{message:"Your access token has expired! Please try again"}}></Error>)}
    </>);
}

export default Dashboard;