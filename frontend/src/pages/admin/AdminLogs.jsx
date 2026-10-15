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

import "./AdminLogs.css";

import {
  getAdminLogs,
} from "../../services/api";

import {
  logoutUser,
} from "../../services/authService";


/* ======================================================
   CONVERT BACKEND EVENT INTO UI EVENT
====================================================== */

function formatLog(
  backendLog,
  index
) {
  const eventType =
    backendLog.eventType ||
    backendLog.event ||
    "UnknownEvent";


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
     EVENT DETAILS
  ==================================================== */

  const detail =
    backendLog.detail || {};


  const entityType =
    backendLog.entityType ||
    (eventType.startsWith("Job")
      ? "Job"
      : eventType.startsWith("Service")
        ? "Service"
        : "Unknown");


  const entityId =
    backendLog.entityId ??
    detail.id ??
    detail.serviceId ??
    detail.service_id ??
    detail.jobId ??
    detail.job_id ??
    null;


  const entityName =
    backendLog.entityName ||
    detail.name ||
    detail.title ||
    detail.serviceName ||
    detail.service_name ||
    detail.jobTitle ||
    detail.job_title ||
    null;


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
     LISTING NAME
  ==================================================== */

  let item =
    entityName;


  if (
    !item &&
    entityId
  ) {
    item =
      `${entityType} #${entityId}`;
  }


  if (!item) {
    item =
      entityType === "Job"
        ? "Job Listing"
        : entityType === "Service"
          ? "Service Listing"
          : "HelpIn Listing";
  }


  /* ====================================================
     DATE / TIME
  ==================================================== */

  const rawTimestamp =
    backendLog.timestamp ||
    backendLog.cloudWatchTimestamp ||
    null;


  let date =
    "Unknown Date";

  let time =
    "—";


  if (rawTimestamp) {
    const parsedDate =
      typeof rawTimestamp === "number"
        ? new Date(rawTimestamp)
        : new Date(rawTimestamp);


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


      time =
        parsedDate.toLocaleTimeString(
          "en-GB",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        );
    }
  }


  return {
    id:
      backendLog.eventId ||
      backendLog.cloudWatchEventId ||
      `${eventType}-${rawTimestamp}-${index}`,

    date,

    time,

    event:
      eventType,

    action,

    item,

    category,

    status:
      "Complete",

    entityId,

    performedBy:
      backendLog.performedBy ||
      "HelpIn Admin",

    timestamp:
      rawTimestamp,

    detail,
  };
}


/* ======================================================
   ADMIN LOGS PAGE
====================================================== */

function AdminLogs() {
  const navigate =
    useNavigate();


  const [logs, setLogs] =
    useState([]);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");


  const [search, setSearch] =
    useState("");


  const [
    actionFilter,
    setActionFilter,
  ] = useState("All");


  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("All");


  /* ====================================================
     LOGOUT
  ==================================================== */

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


  /* ====================================================
     LOAD REAL CLOUDWATCH LOGS
  ==================================================== */

  const loadLogs =
    async () => {
      try {
        setLoading(true);

        setError("");


        const response =
          await getAdminLogs();


        console.log(
          "REAL ADMIN LOGS:",
          response
        );


        const realLogs =
          Array.isArray(response)
            ? response
            : Array.isArray(
                response?.logs
              )
              ? response.logs
              : [];


        const formattedLogs =
          realLogs.map(
            (
              log,
              index
            ) =>
              formatLog(
                log,
                index
              )
          );


        setLogs(
          formattedLogs
        );

      } catch (err) {
        console.error(
          "ADMIN LOGS ERROR:",
          err
        );


        if (
          err?.status === 401
        ) {
          setError(
            "Your admin login session has expired. Please log in again."
          );

        } else if (
          err?.status === 403
        ) {
          setError(
            "You do not have permission to view administrator event logs."
          );

        } else {
          setError(
            err?.message ||
            "Unable to load event logs."
          );
        }

      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    loadLogs();
  }, []);


  /* ====================================================
     FILTER LOGS
  ==================================================== */

  const filteredLogs =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();


      return logs.filter(
        (log) => {

          const matchesSearch =
            String(
              log.event || ""
            )
              .toLowerCase()
              .includes(query) ||

            String(
              log.item || ""
            )
              .toLowerCase()
              .includes(query) ||

            String(
              log.category || ""
            )
              .toLowerCase()
              .includes(query) ||

            String(
              log.action || ""
            )
              .toLowerCase()
              .includes(query) ||

            String(
              log.entityId || ""
            )
              .toLowerCase()
              .includes(query);


          const matchesAction =
            actionFilter ===
              "All" ||
            log.action ===
              actionFilter;


          const matchesCategory =
            categoryFilter ===
              "All" ||
            log.category ===
              categoryFilter;


          return (
            matchesSearch &&
            matchesAction &&
            matchesCategory
          );
        }
      );

    }, [
      logs,
      search,
      actionFilter,
      categoryFilter,
    ]);


  /* ====================================================
     STAT COUNTS
  ==================================================== */

  const addedCount =
    logs.filter(
      (log) =>
        log.action ===
        "Added"
    ).length;


  const updatedCount =
    logs.filter(
      (log) =>
        log.action ===
        "Updated"
    ).length;


  const deletedCount =
    logs.filter(
      (log) =>
        log.action ===
        "Deleted"
    ).length;


  return (
    <div className="logs-admin-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="logs-admin-header">

        <Link
          to="/"
          className="logs-admin-brand"
        >

          <svg
            className="logs-admin-logo"
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


          <div>

            <strong>
              HelpIn
            </strong>


            <span>
              ADMINISTRATION
            </span>

          </div>

        </Link>


        <div className="logs-admin-user">

          <div>

            <strong>
              HelpIn Admin
            </strong>


            <span>
              Admin
            </span>

          </div>


          <div className="logs-admin-avatar">
            HA
          </div>


          <div className="logs-admin-divider" />


          <button
            type="button"
            onClick={
              handleLogout
            }
          >
            ↪ Logout
          </button>

        </div>

      </header>


      {/* ==================================================
          BODY
      ================================================== */}

      <div className="logs-admin-body">

        {/* ==================================================
            SIDEBAR
        ================================================== */}

        <aside className="logs-admin-sidebar">

          <p className="logs-sidebar-heading">
            ADMIN WORKSPACE
          </p>


          <nav>

            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `logs-sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >
              <span>▦</span>

              Dashboard
            </NavLink>


            <NavLink
              to="/admin/services"
              className={({ isActive }) =>
                `logs-sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >
              <span>▤</span>

              Manage Services
            </NavLink>


            <NavLink
              to="/admin/jobs"
              className={({ isActive }) =>
                `logs-sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >
              <span>▤</span>

              Manage Jobs
            </NavLink>


            <NavLink
              to="/admin/listings"
              className={({ isActive }) =>
                `logs-sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >
              <span>▤</span>

              View Listings
            </NavLink>


            <NavLink
              to="/admin/logs"
              className={({ isActive }) =>
                `logs-sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >
              <span>▤</span>

              Event Logs
            </NavLink>

          </nav>

        </aside>


        {/* ==================================================
            MAIN
        ================================================== */}

        <main className="logs-admin-main">

          <section className="logs-admin-title">

            <div>

              <p>
                SYSTEM ACTIVITY
              </p>


              <h1>
                Event Logs
              </h1>


              <span>
                Review administrative changes
                and platform events recorded
                across HelpIn.
              </span>

            </div>


            {/* 
              We no longer use "Clear Logs"
              because these are real CloudWatch records.
            */}

            <button
              type="button"
              className="logs-clear-button"
              onClick={
                loadLogs
              }
              disabled={
                loading
              }
            >
              {loading
                ? "Refreshing..."
                : "Refresh Logs"}
            </button>

          </section>


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <div
              style={{
                marginBottom:
                  "20px",

                padding:
                  "14px 16px",

                background:
                  "#fff3f3",

                border:
                  "1px solid #ffc7c7",

                borderRadius:
                  "10px",

                color:
                  "#b42318",

                fontSize:
                  "13px",

                fontWeight:
                  "700",
              }}
            >
              {error}
            </div>

          )}


          {/* ==================================================
              STATS
          ================================================== */}

          <section className="logs-admin-stats">

            <article className="logs-stat-card blue">

              <div>

                <p>
                  Total Events
                </p>


                <strong>
                  {loading
                    ? "..."
                    : logs.length}
                </strong>


                <span>
                  Recorded events
                </span>

              </div>


              <div className="logs-stat-icon blue">
                ▤
              </div>

            </article>


            <article className="logs-stat-card green">

              <div>

                <p>
                  Added
                </p>


                <strong>
                  {loading
                    ? "..."
                    : addedCount}
                </strong>


                <span>
                  Created listings
                </span>

              </div>


              <div className="logs-stat-icon green">
                ＋
              </div>

            </article>


            <article className="logs-stat-card purple">

              <div>

                <p>
                  Updated
                </p>


                <strong>
                  {loading
                    ? "..."
                    : updatedCount}
                </strong>


                <span>
                  Modified listings
                </span>

              </div>


              <div className="logs-stat-icon purple">
                ✎
              </div>

            </article>


            <article className="logs-stat-card red">

              <div>

                <p>
                  Deleted
                </p>


                <strong>
                  {loading
                    ? "..."
                    : deletedCount}
                </strong>


                <span>
                  Removed listings
                </span>

              </div>


              <div className="logs-stat-icon red">
                ×
              </div>

            </article>

          </section>


          {/* ==================================================
              EVENT HISTORY
          ================================================== */}

          <section className="logs-card">

            <div className="logs-card-header">

              <div>

                <p>
                  EVENT HISTORY
                </p>


                <h2>
                  Administrative Events
                </h2>


                <span>
                  Browse recent service and
                  job management activity.
                </span>

              </div>


              <div className="logs-result-count">

                {loading
                  ? "Loading..."
                  : (
                    <>
                      {
                        filteredLogs.length
                      }
                      {" "}
                      {
                        filteredLogs.length === 1
                          ? "event"
                          : "events"
                      }
                    </>
                  )}

              </div>

            </div>


            {/* ==================================================
                FILTERS
            ================================================== */}

            <div className="logs-filters">

              <div className="logs-search">

                <span>
                  ⌕
                </span>


                <input
                  id="logs-search"
                  name="logsSearch"
                  type="text"
                  value={
                    search
                  }
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search events, listings, IDs or categories..."
                />

              </div>


              <select
                id="logs-action-filter"
                name="logsActionFilter"
                value={
                  actionFilter
                }
                onChange={(event) =>
                  setActionFilter(
                    event.target.value
                  )
                }
              >

                <option value="All">
                  All Actions
                </option>

                <option value="Added">
                  Added
                </option>

                <option value="Updated">
                  Updated
                </option>

                <option value="Deleted">
                  Deleted
                </option>

              </select>


              <select
                id="logs-category-filter"
                name="logsCategoryFilter"
                value={
                  categoryFilter
                }
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value
                  )
                }
              >

                <option value="All">
                  All Categories
                </option>

                <option value="Accommodation">
                  Accommodation
                </option>

                <option value="Food Support">
                  Food Support
                </option>

                <option value="Services">
                  Services
                </option>

                <option value="Jobs">
                  Jobs
                </option>

              </select>

            </div>


            {/* ==================================================
                TABLE
            ================================================== */}

            <div className="logs-table-wrapper">

              <table className="logs-table">

                <thead>

                  <tr>

                    <th>
                      DATE / TIME
                    </th>

                    <th>
                      EVENT
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
                        colSpan="6"
                        className="logs-empty"
                      >
                        Loading real event logs...
                      </td>

                    </tr>

                  ) : error ? (

                    <tr>

                      <td
                        colSpan="6"
                        className="logs-empty"
                      >
                        Unable to display event logs.
                      </td>

                    </tr>

                  ) : filteredLogs.length ===
                    0 ? (

                    <tr>

                      <td
                        colSpan="6"
                        className="logs-empty"
                      >
                        No event logs found.
                      </td>

                    </tr>

                  ) : (

                    filteredLogs.map(
                      (log) => (

                        <tr
                          key={
                            log.id
                          }
                        >

                          {/* DATE / TIME */}

                          <td>

                            <div className="logs-date">

                              <strong>
                                {
                                  log.date
                                }
                              </strong>


                              <span>
                                {
                                  log.time
                                }
                              </span>

                            </div>

                          </td>


                          {/* EVENT */}

                          <td>

                            <span className="logs-event-name">
                              {
                                log.event
                              }
                            </span>

                          </td>


                          {/* ACTION */}

                          <td>

                            <span
                              className={`logs-action ${
                                log.action ===
                                "Added"
                                  ? "added"
                                  : log.action ===
                                    "Updated"
                                    ? "updated"
                                    : "deleted"
                              }`}
                            >
                              {
                                log.action
                              }
                            </span>

                          </td>


                          {/* LISTING */}

                          <td>

                            <strong className="logs-item">
                              {
                                log.item
                              }
                            </strong>

                          </td>


                          {/* CATEGORY */}

                          <td>
                            {
                              log.category ||
                              "—"
                            }
                          </td>


                          {/* STATUS */}

                          <td>

                            <span className="logs-status">

                              <i />

                              {
                                log.status
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

          </section>


          {/* ==================================================
              INFORMATION
          ================================================== */}

          <section className="logs-info-card">

            <div className="logs-info-icon">
              i
            </div>


            <div>

              <strong>
                Real AWS event logging
              </strong>


              <p>
                These events are generated by
                HelpIn administrator actions,
                routed through EventBridge and
                SQS, processed by the Event
                Processor Lambda, and retrieved
                from CloudWatch.
              </p>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}


export default AdminLogs;