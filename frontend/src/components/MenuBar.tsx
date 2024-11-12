import {NavLink} from "react-router-dom"

function MenuBar(){
    return(
    <>
      <button
        className="btn bg-secondary w-100 text-white" 
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasMenu"
        aria-controls="offcanvasMenu"
      >
        Menu
      </button>

      <div
        className="offcanvas offcanvas-start"
        tabIndex={-1}
        id="offcanvasMenu"
        aria-labelledby="offcanvasMenuLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasMenuLabel">
            Menu
          </h5>
          <button
            type="button"
            className="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <ul className="nav flex-column">
            <li className="nav-item">
                <NavLink className="nav-link active" to="/"> Home</NavLink>
            </li>
            <li className="nav-item">
                <NavLink className="nav-link active" to="/profile"> Profile</NavLink>
            </li>
            <li className="nav-item">
                <NavLink className="nav-link active" to="/"> Settings</NavLink>
            </li>
          </ul>
        </div>
      </div>
        </>
    );
}

export default MenuBar;