import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function MenuBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    // No need to manually hide the offcanvas
    if (path === location.pathname) {
      const backdrop = document.querySelector(".offcanvas-backdrop");
      if (backdrop) backdrop.remove();
    }

    navigate(path);
  };

  return (
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
          <h5 className="offcanvas-title primary-text" id="offcanvasMenuLabel">
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
                className="btn btn-link nav-link active secondary-text"
                style={{ fontSize: "20px" }}
                onClick={() => handleNav("/")}
                data-bs-dismiss="offcanvas"
              >
                Home
              </button>
            </li>
            <li className="nav-item">
              <button
                className="btn btn-link nav-link active secondary-text"
                style={{ fontSize: "20px" }}
                onClick={() => handleNav("/dashboard")}
                data-bs-dismiss="offcanvas"
              >
                Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button
                className="btn btn-link nav-link active secondary-text"
                style={{ fontSize: "20px" }}
                onClick={() => handleNav("/settings")}
                data-bs-dismiss="offcanvas"
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
