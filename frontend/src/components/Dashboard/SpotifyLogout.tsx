
import { useAuth } from "../../utils/Authorization";




function SpotifyLogout(){
    const { logout } = useAuth();

    return(<>
    <button className='playlist-btn w-100' onClick = {logout}>Logout</button>
    </>);
}
export default SpotifyLogout;