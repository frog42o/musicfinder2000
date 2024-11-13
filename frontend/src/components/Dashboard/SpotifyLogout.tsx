import { Button } from "react-bootstrap";
import { useAuth } from "../../utils/Authorization";




function SpotifyLogout(){
    const { logout } = useAuth();

    return(<>
    <Button className='btn bg-success w-100 text-white d-block mt-1 w-100' onClick = {logout}>Logout</Button>
    </>);
}
export default SpotifyLogout;