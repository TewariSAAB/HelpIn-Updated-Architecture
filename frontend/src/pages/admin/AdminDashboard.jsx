import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import "./AdminDashboard.css";

import {
  getServices,
  getJobs,
  getAdminLogs,
} from "../../services/api";

import {
  logoutUser,
} from "../../services/authService";


/* ======================================================
   FORMAT REAL ADMIN EVENT FOR DASHBOARD
====================================================== */

function formatActivity(
  backendLog,
  index
) {
  const eventType =
    backendLog?.eventType ||
    "UnknownEvent";

  const detail =
    backendLog?.detail || {};


  /* ====================================================
     ACTION
  ==================================================== */

  let action =
    "Updated";

  if (
    eventType.endsWith(
      "Created"
    )
  ) {
    action = "Added";
  }

  if (
    eventType.endsWith(
      "Updated"
    )
  ) {
    action = "Updated";
  }

  if (
    eventType.endsWith(
      "Deleted"
    )
  ) {
    action = "Deleted";
  }


  /* ====================================================
     TYPE
  ==================================================== */

  const entityType =
    backendLog?.entityType ||
    (
      eventType.startsWith("Job")
        ? "Job"
        : eventType.startsWith("Service")
          ? "Service"
          : "Unknown"
    );


  /* ====================================================
     ID
  ==================================================== */

  const entityId =
    backendLog?.entityId ??
    detail.id ??
    detail.serviceId ??
    detail.service_id ??
    detail.jobId ??
    detail.job_id ??
    null;


  /* ====================================================
     LISTING NAME
  ==================================================== */

  const entityName =
    backendLog?.entityName ||
    detail.name ||
    detail.title ||
    detail.serviceName ||
    detail.service_name ||
    detail.jobTitle ||
    detail.job_title ||
    null;


  let listing =
    entityName;


  if (
    !listing &&
    entityId
  ) {
    listing =
      `${entityType} #${entityId}`;
  }


  if (!listing) {
    listing =
      entityType === "Job"
        ? "Job Listing"
        : entityType === "Service"
          ? "Service Listing"
          : "HelpIn Listing";
  }


  /* ====================================================
     CATEGORY
  ==================================================== */

  let category =
    detail.category ||
    detail.serviceCategory ||
    detail.service_category ||
    "";


  if (
    entityType === "Job"
  ) {
    category = "Jobs";
  }


  if (
    entityType === "Service" &&
    !category
  ) {
    category = "Services";
  }


  /* ====================================================
     DATE
  ==================================================== */

  const rawTimestamp =
    backendLog?.timestamp ||
    backendLog?.cloudWatchTimestamp ||
    null;


  let date =
    "Unknown Date";


  if (rawTimestamp) {
    const parsedDate =
      new Date(rawTimestamp);


    if (
      !Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      date =
        parsedDate.toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        );
    }
  }


  return {
    id:
      backendLog?.eventId ||
      backendLog?.cloudWatchEventId ||
      `${eventType}-${rawTimestamp}-${index}`,

    date,

    action,

    listing,

    category,

    status:
      "Complete",

    timestamp:
      rawTimestamp,

    eventType,
  };
}


function AdminDashboard() {
  const navigate =
    useNavigate();


  const [services, setServices] =
    useState([]);


  const [jobs, setJobs] =
    useState([]);


  const [
    activityLogs,
    setActivityLogs,
  ] = useState([]);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");


  const [
    lastUpdated,
    setLastUpdated,
  ] = useState("");


  /* ======================================================
     LOGOUT
  ====================================================== */

  const handleLogout =
    async () => {
      await logoutUser();

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    };


  /* ======================================================
     LOAD REAL DASHBOARD DATA
  ====================================================== */

  useEffect(() => {
    let cancelled =
      false;


    async function loadDashboard() {
      try {
        setLoading(true);

        setError("");


        const [
          servicesResponse,
          jobsResponse,
          logsResponse,
        ] =
          await Promise.all([
            getServices(),
            getJobs(),
            getAdminLogs(),
          ]);


        if (cancelled) {
          return;
        }


        /* ================================================
           SERVICES
        ================================================ */

        const realServices =
          Array.isArray(
            servicesResponse
          )
            ? servicesResponse
            : servicesResponse?.services ||
              [];


        /* ================================================
           JOBS
        ================================================ */

        const realJobs =
          Array.isArray(
            jobsResponse
          )
            ? jobsResponse
            : jobsResponse?.jobs ||
              [];


        /* ================================================
           REAL CLOUDWATCH EVENT LOGS
        ================================================ */

        const realLogs =
          Array.isArray(
            logsResponse
          )
            ? logsResponse
            : Array.isArray(
                logsResponse?.logs
              )
              ? logsResponse.logs
              : [];


        console.log(
          "DASHBOARD SERVICES:",
          realServices
        );

        console.log(
          "DASHBOARD JOBS:",
          realJobs
        );

        console.log(
          "DASHBOARD REAL LOGS:",
          realLogs
        );


        setServices(
          realServices
        );

        setJobs(
          realJobs
        );


        /* ================================================
           FORMAT + SORT EVENT LOGS
        ================================================ */

        const formattedLogs =
          realLogs
            .map(
              (
                log,
                index
              ) =>
                formatActivity(
                  log,
                  index
                )
            )
            .sort(
              (a, b) => {
                const timeA =
                  new Date(
                    a.timestamp ||
                    0
                  ).getTime();

                const timeB =
                  new Date(
                    b.timestamp ||
                    0
                  ).getTime();


                return (
                  timeB -
                  timeA
                );
              }
            );


        setActivityLogs(
          formattedLogs
        );


        /* ================================================
           LAST UPDATED
        ================================================ */

        const now =
          new Date();


        setLastUpdated(
          now.toLocaleString(
            "en-GB",
            {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }
          )
        );

      } catch (err) {
        console.error(
          "DASHBOARD API ERROR:",
          err
        );


        if (
          err?.status === 401 ||
          err?.status === 403
        ) {
          setError(
            "Unable to load administrator activity. Please log in again."
          );

        } else {
          setError(
            err?.message ||
            "Unable to load dashboard data from AWS."
          );
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }


    loadDashboard();


    return () => {
      cancelled =
        true;
    };
  }, []);


  /* ======================================================
     ACTIVE STATUS
  ====================================================== */

  const isActive =
    (item) => {
      const status =
        String(
          item?.status ||
          "active"
        ).toLowerCase();


      return (
        status === "active"
      );
    };


  /* ======================================================
     COUNTS
  ====================================================== */

  const totalServices =
    services.length;


  const totalJobs =
    jobs.length;


  const activeServices =
    useMemo(
      () =>
        services.filter(
          isActive
        ).length,
      [services]
    );


  const activeJobs =
    useMemo(
      () =>
        jobs.filter(
          isActive
        ).length,
      [jobs]
    );


  const activeListings =
    activeServices +
    activeJobs;


  /* ======================================================
     REAL RECENT ACTIVITY

     Only show latest 5 on Dashboard.
     Full history remains under Event Logs.
  ====================================================== */

  const recentActivity =
    useMemo(
      () =>
        activityLogs.slice(
          0,
          5
        ),
      [activityLogs]
    );


  const recentUpdates =
    activityLogs.length;


  return (
    <div className="admin-dashboard-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="admin-header">

        <Link
          to="/"
          className="admin-header-brand"
        >

          <svg
            className="admin-header-logo"
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


          <div className="admin-header-brand-text">

            <strong>
              HelpIn
            </strong>


            <span>
              ADMINISTRATION
            </span>

          </div>

        </Link>


        <div className="admin-header-right">

          <div className="admin-header-user-info">

            <strong>
              HelpIn Admin
            </strong>


            <span>
              Admin
            </span>

          </div>


          <div className="admin-header-avatar">
            HA
          </div>


          <div className="admin-header-divider" />


          <button
            type="button"
            className="admin-header-logout"
            onClick={
              handleLogout
            }
          >

            <span className="admin-logout-icon">
              ↪
            </span>

            Logout

          </button>

        </div>

      </header>


      {/* ==================================================
          BODY
      ================================================== */}

      <div className="admin-dashboard-body">

        {/* ==================================================
            SIDEBAR
        ================================================== */}

        <aside className="admin-dashboard-sidebar">

          <p className="admin-sidebar-heading">
            ADMIN WORKSPACE
          </p>


          <nav className="admin-sidebar-nav">

            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `admin-sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >

              <span className="admin-sidebar-icon">
                ▦
              </span>

              Dashboard

            </NavLink>


            <NavLink
              to="/admin/services"
              className={({ isActive }) =>
                `admin-sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >

              <span className="admin-sidebar-icon">
                ▤
              </span>

              Manage Services

            </NavLink>


            <NavLink
              to="/admin/jobs"
              className={({ isActive }) =>
                `admin-sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >

              <span className="admin-sidebar-icon">
                ▤
              </span>

              Manage Jobs

            </NavLink>


            <NavLink
              to="/admin/listings"
              className={({ isActive }) =>
                `admin-sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >

              <span className="admin-sidebar-icon">
                ▤
              </span>

              View Listings

            </NavLink>


            <NavLink
              to="/admin/contact-messages"
              className={({ isActive }) =>
                `admin-sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >

              <span className="admin-sidebar-icon">
                ✉
              </span>

              Contact Messages

            </NavLink>


            <NavLink
              to="/admin/logs"
              className={({ isActive }) =>
                `admin-sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >

              <span className="admin-sidebar-icon">
                ▤
              </span>

              Event Logs

            </NavLink>

          </nav>

        </aside>


        {/* ==================================================
            MAIN
        ================================================== */}

        <main className="admin-dashboard-main">

          {/* ==================================================
              TITLE
          ================================================== */}

          <section className="admin-dashboard-title-row">

            <div>

              <p className="admin-dashboard-eyebrow">
                OVERVIEW
              </p>


              <h1>
                Admin Dashboard
              </h1>


              <p className="admin-dashboard-subtitle">
                Manage HelpIn services,
                job listings and platform
                activity.
              </p>


              {error && (

                <p
                  style={{
                    marginTop:
                      "10px",

                    color:
                      "#d14343",

                    fontWeight:
                      "600",

                    fontSize:
                      "13px",
                  }}
                >
                  {error}
                </p>

              )}

            </div>


            <div className="admin-dashboard-updated">

              {loading
                ? "Loading dashboard..."
                : lastUpdated
                  ? `Last updated: ${lastUpdated}`
                  : "Last updated unavailable"}

            </div>

          </section>


          {/* ==================================================
              STATS
          ================================================== */}

          <section className="admin-dashboard-stats">

            {/* TOTAL SERVICES */}

            <article className="admin-dashboard-stat services">

              <div className="admin-stat-content">

                <p>
                  Total Services
                </p>


                <strong>
                  {loading
                    ? "..."
                    : totalServices}
                </strong>


                <span>
                  Across all categories
                </span>

              </div>


              <div className="admin-stat-box blue">
                ▣
              </div>

            </article>


            {/* TOTAL JOBS */}

            <article className="admin-dashboard-stat jobs">

              <div className="admin-stat-content">

                <p>
                  Total Jobs
                </p>


                <strong>
                  {loading
                    ? "..."
                    : totalJobs}
                </strong>


                <span>
                  Open opportunities
                </span>

              </div>


              <div className="admin-stat-box green">
                ▣
              </div>

            </article>


            {/* ACTIVE LISTINGS */}

            <article className="admin-dashboard-stat active-listings">

              <div className="admin-stat-content">

                <p>
                  Active Listings
                </p>


                <strong>
                  {loading
                    ? "..."
                    : activeListings}
                </strong>


                <span>
                  Currently visible
                </span>

              </div>


              <div className="admin-stat-box purple">
                ◉
              </div>

            </article>


            {/* REAL RECENT UPDATES */}

            <article className="admin-dashboard-stat updates">

              <div className="admin-stat-content">

                <p>
                  Recent Updates
                </p>


                <strong>
                  {loading
                    ? "..."
                    : recentUpdates}
                </strong>


                <span>
                  Recent platform activity
                </span>

              </div>


              <div className="admin-stat-box orange">
                ◷
              </div>

            </article>

          </section>


          {/* ==================================================
              LOWER AREA
          ================================================== */}

          <section className="admin-dashboard-lower">

            {/* ==================================================
                RECENT ACTIVITY
            ================================================== */}

            <div className="admin-recent-card">

              <div className="admin-recent-header">

                <div>

                  <h2>
                    Recent Activity
                  </h2>


                  <p>
                    Latest changes made
                    across HelpIn
                  </p>

                </div>


                <Link
                  to="/admin/logs"
                  className="admin-view-logs"
                >
                  View All Logs

                  <span>
                    →
                  </span>

                </Link>

              </div>


              <div className="admin-activity-table-wrapper">

                <table className="admin-activity-table">

                  <thead>

                    <tr>
                      <th>
                        DATE
                      </th>

                      <th>
                        ACTION
                      </th>

                      <th>
                        LISTING
                      </th>

                      <th>
                        CATEGORY
                      </th>

                      <th>
                        STATUS
                      </th>
                    </tr>

                  </thead>


                  <tbody>

                    {loading ? (

                      <tr>

                        <td
                          colSpan="5"
                          style={{
                            textAlign:
                              "center",

                            padding:
                              "30px",
                          }}
                        >
                          Loading recent activity...
                        </td>

                      </tr>

                    ) : recentActivity.length ===
                      0 ? (

                      <tr>

                        <td
                          colSpan="5"
                          style={{
                            textAlign:
                              "center",

                            padding:
                              "30px",
                          }}
                        >
                          No recent activity found.
                        </td>

                      </tr>

                    ) : (

                      recentActivity.map(
                        (activity) => (

                          <tr
                            key={
                              activity.id
                            }
                          >

                            {/* DATE */}

                            <td>
                              {
                                activity.date
                              }
                            </td>


                            {/* ACTION */}

                            <td>

                              <span
                                className={
                                  `activity-action ${
                                    activity.action ===
                                    "Added"
                                      ? "added"
                                      : "updated"
                                  }`
                                }
                              >
                                {
                                  activity.action
                                }
                              </span>

                            </td>


                            {/* LISTING */}

                            <td className="activity-name">
                              {
                                activity.listing
                              }
                            </td>


                            {/* CATEGORY */}

                            <td>
                              {
                                activity.category ||
                                "—"
                              }
                            </td>


                            {/* STATUS */}

                            <td>

                              <span className="activity-status">

                                <i />

                                {
                                  activity.status
                                }

                              </span>

                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </div>


            {/* ==================================================
                QUICK ACTIONS
            ================================================== */}

            <aside className="admin-quick-card">

              <p className="admin-quick-eyebrow">
                SHORTCUTS
              </p>


              <h2>
                Quick Actions
              </h2>


              <p className="admin-quick-description">
                Create and review
                platform content.
              </p>


              <Link
                to="/admin/services"
                className="admin-quick-action primary"
              >

                <span className="admin-quick-icon">
                  ▤
                </span>


                <strong>
                  Manage Services
                </strong>


                <span className="admin-quick-arrow">
                  →
                </span>

              </Link>


              <Link
                to="/admin/jobs"
                className="admin-quick-action"
              >

                <span className="admin-quick-icon">
                  💼
                </span>


                <strong>
                  Manage Jobs
                </strong>


                <span className="admin-quick-arrow">
                  →
                </span>

              </Link>


              <Link
                to="/admin/listings"
                className="admin-quick-action"
              >

                <span className="admin-quick-icon">
                  ▣
                </span>


                <strong>
                  View All Listings
                </strong>


                <span className="admin-quick-arrow">
                  →
                </span>

              </Link>


              <Link
                to="/admin/logs"
                className="admin-quick-action"
              >

                <span className="admin-quick-icon">
                  ▤
                </span>


                <strong>
                  View Event Logs
                </strong>


                <span className="admin-quick-arrow">
                  →
                </span>

              </Link>

            </aside>

          </section>

        </main>

      </div>

    </div>
  );
}


export default AdminDashboard;