import {
  useEffect,
  useState,
} from "react";

import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  logoutUser,
} from "../services/authService";

import "./AdminResponsiveShell.css";


function HelpInLogo() {
  return (
    <svg
      className="responsive-admin-logo"
      viewBox="0 0 60 60"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="20"
        cy="12"
        r="6.5"
        fill="#13B5AE"
      />

      <path
        d="M18 20C9 21 6 29 8 36C10 43 18 48 30 54"
        stroke="#13B5AE"
        strokeWidth="6"
        strokeLinecap="round"
      />

      <path
        d="M18 26C14 25 11 27 10 31C15 29 19 30 23 34"
        stroke="#13B5AE"
        strokeWidth="5"
        strokeLinecap="round"
      />

      <circle
        cx="40"
        cy="12"
        r="6.5"
        fill="#1769F6"
      />

      <path
        d="M42 20C51 21 54 29 52 36C50 43 42 48 30 54"
        stroke="#1769F6"
        strokeWidth="6"
        strokeLinecap="round"
      />

      <path
        d="M42 26C46 25 49 27 50 31C45 29 41 30 37 34"
        stroke="#1769F6"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}


function AdminResponsiveShell({
  children,
}) {
  const navigate = useNavigate();

  const location = useLocation();

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);


  /* ======================================================
     CLOSE MENU WHEN ROUTE CHANGES
  ====================================================== */

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);


  /* ======================================================
     PREVENT BODY SCROLL WHEN DRAWER OPEN
  ====================================================== */

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow =
        "";
    }

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [menuOpen]);


  /* ======================================================
     LOGOUT
  ====================================================== */

  const handleLogout = async () => {
    await logoutUser();

    setMenuOpen(false);

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  };


  return (
    <div
      className={
        `admin-responsive-shell ${
          menuOpen
            ? "menu-open"
            : ""
        }`
      }
    >

      {/* ==================================================
          MOBILE HEADER
      ================================================== */}

      <header className="responsive-admin-header">

        <NavLink
          to="/admin"
          className="responsive-admin-brand"
        >

          <HelpInLogo />

          <strong>
            HelpIn
          </strong>

        </NavLink>


        <div className="responsive-admin-header-actions">

          <span className="responsive-admin-badge">
            ADMIN
          </span>


          <button
            type="button"
            className="responsive-admin-menu-button"
            aria-label={
              menuOpen
                ? "Close admin menu"
                : "Open admin menu"
            }
            aria-expanded={
              menuOpen
            }
            onClick={() =>
              setMenuOpen(
                (current) =>
                  !current
              )
            }
          >

            {menuOpen ? (
              <span className="responsive-admin-close">
                ×
              </span>
            ) : (
              <>
                <span />
                <span />
                <span />
              </>
            )}

          </button>

        </div>

      </header>


      {/* ==================================================
          MOBILE OVERLAY
      ================================================== */}

      <button
        type="button"
        className={
          `responsive-admin-overlay ${
            menuOpen
              ? "visible"
              : ""
          }`
        }
        aria-label="Close admin navigation"
        onClick={() =>
          setMenuOpen(false)
        }
      />


      {/* ==================================================
          MOBILE DRAWER
      ================================================== */}

      <aside
        className={
          `responsive-admin-drawer ${
            menuOpen
              ? "open"
              : ""
          }`
        }
      >

        <div className="responsive-drawer-heading">

          <p>
            ADMIN WORKSPACE
          </p>

          <span>
            HelpIn Administration
          </span>

        </div>


        <nav className="responsive-drawer-nav">

          <NavLink
            to="/admin"
            end
            className={({
              isActive,
            }) =>
              `responsive-drawer-link ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >
            <span>
              ▦
            </span>

            Dashboard
          </NavLink>


          <NavLink
            to="/admin/services"
            className={({
              isActive,
            }) =>
              `responsive-drawer-link ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >
            <span>
              ▤
            </span>

            Manage Services
          </NavLink>


          <NavLink
            to="/admin/jobs"
            className={({
              isActive,
            }) =>
              `responsive-drawer-link ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >
            <span>
              ▤
            </span>

            Manage Jobs
          </NavLink>


          <NavLink
            to="/admin/listings"
            className={({
              isActive,
            }) =>
              `responsive-drawer-link ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >
            <span>
              ▣
            </span>

            View Listings
          </NavLink>


          <NavLink
            to="/admin/logs"
            className={({
              isActive,
            }) =>
              `responsive-drawer-link ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >
            <span>
              ▤
            </span>

            Event Logs
          </NavLink>

        </nav>


        <div className="responsive-drawer-footer">

          <div className="responsive-drawer-user">

            <div className="responsive-drawer-avatar">
              HA
            </div>

            <div>
              <strong>
                HelpIn Admin
              </strong>

              <span>
                Administrator
              </span>
            </div>

          </div>


          <button
            type="button"
            className="responsive-drawer-logout"
            onClick={
              handleLogout
            }
          >
            ↪ Logout
          </button>

        </div>

      </aside>


      {/* ==================================================
          EXISTING ADMIN PAGE
      ================================================== */}

      <div className="admin-responsive-content">

        {children}

      </div>

    </div>
  );
}


export default AdminResponsiveShell;