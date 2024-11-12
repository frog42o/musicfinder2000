import { Button } from "react-bootstrap";
import MenuBar from '../components/MenuBar'
function Home(){
    return(
        <>
        <div className="container-sm bg-secondary-subtle p-5 py-3 d-flex flex-column align-items-center mx-auto rounded-5 shadow ">
            <h3>musicfinder2000</h3>
            <p className="text-center">a little project that uses a little of everything to find you some new music!</p>
            <div className="bg-light d-flex flex-column align-items-center p-4 py-3 col rounded-4"> 
                <MenuBar/>
                <Button className="btn btn-success d-block mt-1 w-100 text-white">Login with Spotify</Button>
            </div>
        </div>
        </>
    );
}

export default Home;