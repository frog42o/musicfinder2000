import React from 'react';
import { UserDataProps } from '../../types';
import FetchPlaylist from './FetchPlaylist';
    const UserData: React.FC<UserDataProps> = ({data}) => {
        return (<>
            <div className="tc-w d-flex flex-row mb-3 justify-content-start blur-container w-75 gap-2 rounded-5">
                <div className='p-1'>
                    <img
                        src={data.images?.[0]?.url || ""}
                        alt={`${data.display_name}'s profile`}
                        className="circle-profile border border-dark"
                    />
                </div>
                <div className = "p-2 text-start">
                    <p className='primary-text mt-1 mb-0'>{data.display_name} <span className='secondary-text'> • {data.id}  • Followers: {data.followers.total}</span></p>
                    <span className='secondary-text mb-0 tc-w'>{data.email}</span>
                </div>
            </div>
            <FetchPlaylist data = {data}/>
        </>);
        
}
export default UserData;