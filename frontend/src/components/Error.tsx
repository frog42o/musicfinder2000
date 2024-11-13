
import React from 'react'
import { ErrorProps } from '../types';
import { NavLink } from 'react-router-dom';
const Error: React.FC<ErrorProps> =({data}) =>{
    return(<>
        {data?<p>Error: {data.message}</p>: <></>}
        <NavLink to={'/'}>Return Home</NavLink>
    </>);
}
export default Error;