import {Offcanvas } from "bootstrap";
import { useEffect } from "react";
import {useLocation, useNavigate} from "react-router-dom"

function MenuBar(){
    const location = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
      const offcanvasElement = document.getElementById("offcanvasMenu");
      if (offcanvasElement) {
        const offcanvasInstance = Offcanvas.getOrCreateInstance(offcanvasElement);
        offcanvasInstance.hide();
      }
    }, [location.pathname]); 
    const handleNav = (path:string) => {
      const offcanvasElement = document.getElementById("offcanvasMenu");
      if (offcanvasElement) {
        const offcanvasInstance = Offcanvas.getInstance(offcanvasElement) || new Offcanvas(offcanvasElement);
        offcanvasInstance.hide();
      }

     if (path === location.pathname) {
        const backdrop = document.querySelector(".offcanvas-backdrop");
        if (backdrop) backdrop.remove();
    }

      navigate(path); 
    };
    return(
    <>
      <button
        className="playlist-btn w-100" 
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
              <button
                className="btn btn-link nav-link active"
                onClick={() => handleNav("/")}
              >
                Home
              </button>
            </li>
            <li className="nav-item">
              <button
                className="btn btn-link nav-link active"
                onClick={() => handleNav("/dashboard")}
              >
                Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button
                className="btn btn-link nav-link active"
                onClick={() => handleNav("/settings")}
              >
                Settings
              </button>
            </li>
          </ul>
        </div>
      </div>
        </>
    );
}

export default MenuBar;