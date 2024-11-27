import SpotifyLogin from './SpotifyLogin';
import { Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../utils/Authorization';
import SpotifyLogout from '../Dashboard/SpotifyLogout';

const Home: React.FC = () => {
    const { isAuthenticated} = useAuth();
    return(
        <>
        <div className="container-sm p-5 py-3 d-flex flex-column align-items-center mx-auto rounded-5 shadow blur-container">
            <h3 className='primary-text'>musicfinder-2000</h3>
            <p className="text-center mt-3 secondary-text">a little project that uses a little of everything to find you some new music!</p>
            <div className="d-flex flex-column align-items-center p-4 py-3 col rounded-4"> 
                {isAuthenticated? <><Button className='mt-1 btn btn-success uppercase-text'><NavLink className="nav-link active" to ="/dashboard">Dashboard</NavLink></Button>
                <SpotifyLogout/>
                </>
                : <SpotifyLogin/>}
            </div>
        </div>
        </>
    );
}

export default Home;