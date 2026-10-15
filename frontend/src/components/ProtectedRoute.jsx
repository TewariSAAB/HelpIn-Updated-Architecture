import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  isLoggedIn,
} from "../services/authService";


function ProtectedRoute({
  children,
}) {
  const location =
    useLocation();


  /* ======================================================
     CHECK COGNITO LOGIN
  ====================================================== */

  const authenticated =
    isLoggedIn();


  /* ======================================================
     NOT LOGGED IN
  ====================================================== */

  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname,
        }}
      />
    );
  }


  /* ======================================================
     LOGGED IN
  ====================================================== */

  return children;
}


export default ProtectedRoute;