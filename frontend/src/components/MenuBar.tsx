import {NavLink} from 'react-router-dom'

function MenuBar(){
    return(
        <>
        <nav>
            <ul>
                <li>
                    <NavLink to="/"  className={({ isActive }) => {return isActive ? "active-link" : "";}}>Home</NavLink>
                </li>
                <li>
                    <NavLink to="/profile">Profile</NavLink>
                </li>
    
            </ul>
        </nav>
        </>
    );
}

export default MenuBar;