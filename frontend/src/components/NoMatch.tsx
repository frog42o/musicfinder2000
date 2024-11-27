import { useNavigate } from "react-router-dom";

function NoMatch(){
    const navigate = useNavigate();
    return (
       
        <>
        <p className="tc-w">URL Link does not exist!</p>
        <button onClick={()=> navigate(-1)}>Go Back</button>
        </>
    );
}
export default NoMatch;