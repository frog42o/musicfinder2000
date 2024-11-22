
import React from 'react'
import { ErrorProps } from '../types';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
const Error: React.FC<ErrorProps> =({data}) =>{

    const navigate = useNavigate();
    const refreshPage =()=>{
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.clear();
        document.cookie = ""; 
        navigate("/");
        window.location.reload();
    }
    return(<>
        {data?<p className='tc-w'>Error: {data.message}</p>: <></>}
        <Button className="btn btn-success mt-1 uppercase-text" onClick={refreshPage}>Return Home</Button>
    </>);
}
export default Error;