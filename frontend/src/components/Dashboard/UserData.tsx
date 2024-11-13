import React from 'react';
import { UserDataProps } from '../../types';
import FetchPlaylist from './FetchPlaylist';
    const UserData: React.FC<UserDataProps> = ({data}) => {
        return (<>
            <div className="bg-secondary-subtle border border-dark d-flex flex-row mb-3 text-align-left">
                <div className='p-2'>
                <img
                    src={data.images?.[0]?.url || ""}
                    alt={`${data.display_name}'s profile`}
                    className="circle-profile border border-dark"
                />
                </div>
                <div className = "p-1 ms-2">
                    <p style={{ textAlign: "left" }} className='primary-text mt-1 mb-0'>{data.display_name} <span className='secondary-text'>({data.id})</span></p>
                    <span className='secondary-text mb-0 tc-g'>@{data.email}</span>
                </div>
            </div>
            <FetchPlaylist data = {data}/>
        </>);
        
}
export default UserData;