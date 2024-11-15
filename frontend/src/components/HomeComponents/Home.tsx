import SpotifyLogin from './SpotifyLogin';
import MenuBar from './MenuBar'
import { Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../utils/Authorization';

const Home: React.FC = () => {
    const { isAuthenticated} = useAuth();
    return(
        <>
        <div className="container-sm bg-secondary-subtle p-5 py-3 d-flex flex-column align-items-center mx-auto rounded-5 shadow ">
            <h3>musicfinder2000</h3>
            <p className="text-center">a little project that uses a little of everything to find you some new music!</p>
            <div className="bg-light d-flex flex-column align-items-center p-4 py-3 col rounded-4"> 
                {isAuthenticated? <Button className='mt-1 btn btn-success uppercase-text'><NavLink className="nav-link active" to ="/dashboard">Dashboard</NavLink></Button>: <SpotifyLogin/>}
                <MenuBar/>
            </div>
        </div>
        </>
    );
}

export default Home;