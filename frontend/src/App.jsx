import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import {
  useLayoutEffect,
} from "react";


/* ======================================================
   PUBLIC PAGES
====================================================== */

import Home
  from "./pages/Home.jsx";

import Accommodation
  from "./pages/Accommodation.jsx";

import FoodSupport
  from "./pages/FoodSupport.jsx";

import Jobs
  from "./pages/Jobs.jsx";

import Recommendations
  from "./pages/Recommendations.jsx";

import ServiceDetails
  from "./pages/ServiceDetails.jsx";

import JobDetails
  from "./pages/JobDetails.jsx";

import Login
  from "./pages/Login.jsx";

import Contact
  from "./pages/Contact.jsx";


/* ======================================================
   ADMIN PAGES
====================================================== */

import AdminDashboard
  from "./pages/admin/AdminDashboard.jsx";

import ManageServices
  from "./pages/admin/ManageServices.jsx";

import ManageJobs
  from "./pages/admin/ManageJobs.jsx";

import ViewListings
  from "./pages/admin/ViewListings.jsx";

import AdminLogs
  from "./pages/admin/AdminLogs.jsx";

import AdminContactMessages
  from "./pages/admin/AdminContactMessages.jsx";


/* ======================================================
   ROUTE PROTECTION
====================================================== */

import ProtectedRoute
  from "./components/ProtectedRoute.jsx";


/* ======================================================
   RESPONSIVE ADMIN SHELL
====================================================== */

import AdminResponsiveShell
  from "./components/AdminResponsiveShell.jsx";


/* ======================================================
   RESET SCROLL ON ROUTE CHANGE
====================================================== */

function ScrollToTop() {
  const location =
    useLocation();

  useLayoutEffect(() => {
    if (
      "scrollRestoration" in
      window.history
    ) {
      window.history.scrollRestoration =
        "manual";
    }

    document.documentElement.scrollTop =
      0;

    document.body.scrollTop =
      0;

    window.scrollTo(
      0,
      0
    );

    const frame =
      window.requestAnimationFrame(
        () => {
          window.scrollTo(
            0,
            0
          );
        }
      );

    return () => {
      window.cancelAnimationFrame(
        frame
      );
    };
  }, [location.pathname]);

  return null;
}


/* ======================================================
   ADMIN PAGE WRAPPER
====================================================== */

function ProtectedAdminPage({
  children,
}) {
  return (
    <ProtectedRoute>

      <AdminResponsiveShell>

        {children}

      </AdminResponsiveShell>

    </ProtectedRoute>
  );
}


function App() {
  return (
    <>

      <ScrollToTop />

      <Routes>

      {/* ==================================================
          PUBLIC
      ================================================== */}

      <Route
        path="/"
        element={
          <Home />
        }
      />


      <Route
        path="/accommodation"
        element={
          <Accommodation />
        }
      />


      <Route
        path="/food-support"
        element={
          <FoodSupport />
        }
      />


      <Route
        path="/jobs"
        element={
          <Jobs />
        }
      />


      <Route
        path="/jobs/:id"
        element={
          <JobDetails />
        }
      />


      <Route
        path="/recommendations"
        element={
          <Recommendations />
        }
      />


      <Route
        path="/services/:id"
        element={
          <ServiceDetails />
        }
      />


      <Route
        path="/login"
        element={
          <Login />
        }
      />


      <Route
        path="/contact"
        element={
          <Contact />
        }
      />


      {/* ==================================================
          ADMIN DASHBOARD
      ================================================== */}

      <Route
        path="/admin"
        element={
          <ProtectedAdminPage>

            <AdminDashboard />

          </ProtectedAdminPage>
        }
      />


      {/* ==================================================
          MANAGE SERVICES
      ================================================== */}

      <Route
        path="/admin/services"
        element={
          <ProtectedAdminPage>

            <ManageServices />

          </ProtectedAdminPage>
        }
      />


      {/* ==================================================
          MANAGE JOBS
      ================================================== */}

      <Route
        path="/admin/jobs"
        element={
          <ProtectedAdminPage>

            <ManageJobs />

          </ProtectedAdminPage>
        }
      />


      {/* ==================================================
          VIEW LISTINGS
      ================================================== */}

      <Route
        path="/admin/listings"
        element={
          <ProtectedAdminPage>

            <ViewListings />

          </ProtectedAdminPage>
        }
      />


      {/* ==================================================
          CONTACT MESSAGES
      ================================================== */}

      <Route
        path="/admin/contact-messages"
        element={
          <ProtectedAdminPage>

            <AdminContactMessages />

          </ProtectedAdminPage>
        }
      />


      {/* ==================================================
          EVENT LOGS
      ================================================== */}

      <Route
        path="/admin/logs"
        element={
          <ProtectedAdminPage>

            <AdminLogs />

          </ProtectedAdminPage>
        }
      />


      {/* ==================================================
          UNKNOWN
      ================================================== */}

      <Route
        path="*"
        element={
          <Home />
        }
      />

      </Routes>

    </>
  );
}


export default App;