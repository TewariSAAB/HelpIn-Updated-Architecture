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

import "./ViewListings.css";

import {
  getServices,
  getJobs,
} from "../../services/api";

import {
  logoutUser,
} from "../../services/authService";


function ViewListings() {
  const navigate =
    useNavigate();

  const [services, setServices] =
    useState([]);

  const [jobs, setJobs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [
    listingFilter,
    setListingFilter,
  ] = useState("All");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");


  const handleLogout = async () => {
    await logoutUser();

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  };


  useEffect(() => {
    async function loadListings() {
      try {
        setLoading(true);
        setError("");

        const [
          servicesResponse,
          jobsResponse,
        ] = await Promise.all([
          getServices(),
          getJobs(),
        ]);

        const realServices =
          Array.isArray(
            servicesResponse
          )
            ? servicesResponse
            : servicesResponse?.services ||
              [];

        const realJobs =
          Array.isArray(
            jobsResponse
          )
            ? jobsResponse
            : jobsResponse?.jobs ||
              [];

        setServices(
          realServices
        );

        setJobs(
          realJobs
        );
      } catch (err) {
        console.error(
          "LISTINGS API ERROR:",
          err
        );

        setError(
          "Unable to load listings from the server."
        );
      } finally {
        setLoading(false);
      }
    }

    loadListings();
  }, []);


  const formattedServices =
    useMemo(
      () =>
        services.map(
          (service) => {
            const price =
              service.price;

            const costType =
              service.cost_type ||
              service.costType ||
              "";

            let value = "Free";

            if (
              price !== null &&
              price !== undefined &&
              Number(price) > 0
            ) {
              value =
                `£${price}${
                  costType
                    ? ` ${costType}`
                    : ""
                }`;
            }

            return {
              id: service.id,
              name:
                service.name ||
                "Unnamed Service",
              listingType:
                "Service",
              category:
                service.category ||
                "Service",
              location:
                service.location ||
                "Not specified",
              detail:
                service.service_type ||
                service.serviceType ||
                "Service",
              value,
              status:
                service.status ||
                "Active",
              editUrl:
                "/admin/services",
            };
          }
        ),
      [services]
    );


  const formattedJobs =
    useMemo(
      () =>
        jobs.map(
          (job) => ({
            id: job.id,
            name:
              job.title ||
              "Untitled Job",
            listingType:
              "Job",
            category:
              job.category ||
              "Job",
            location:
              job.location ||
              "Not specified",
            detail:
              job.job_type ||
              job.jobType ||
              "Job",
            value:
              job.pay ||
              "Not specified",
            status:
              job.status ||
              "Active",
            editUrl:
              "/admin/jobs",
          })
        ),
      [jobs]
    );


  const allListings =
    useMemo(
      () => [
        ...formattedServices,
        ...formattedJobs,
      ],
      [
        formattedServices,
        formattedJobs,
      ]
    );


  const filteredListings =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return allListings.filter(
        (item) => {
          const name =
            String(
              item.name || ""
            ).toLowerCase();

          const category =
            String(
              item.category || ""
            ).toLowerCase();

          const location =
            String(
              item.location || ""
            ).toLowerCase();

          const detail =
            String(
              item.detail || ""
            ).toLowerCase();

          const matchesSearch =
            name.includes(query) ||
            category.includes(query) ||
            location.includes(query) ||
            detail.includes(query);

          const matchesType =
            listingFilter ===
              "All" ||
            item.listingType ===
              listingFilter;

          const matchesStatus =
            statusFilter === "All" ||
            String(
              item.status
            ).toLowerCase() ===
              statusFilter.toLowerCase();

          return (
            matchesSearch &&
            matchesType &&
            matchesStatus
          );
        }
      );
    }, [
      allListings,
      search,
      listingFilter,
      statusFilter,
    ]);


  return (
    <div className="listings-admin-page">

      <header className="listings-admin-header">

        <Link
          to="/"
          className="listings-admin-brand"
        >
          <svg
            className="listings-admin-logo"
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


        <div className="listings-admin-user">

          <div>
            <strong>
              HelpIn Admin
            </strong>

            <span>
              Admin
            </span>
          </div>

          <div className="listings-admin-avatar">
            HA
          </div>

          <div className="listings-admin-divider" />

          <button
            type="button"
            onClick={handleLogout}
          >
            ↪ Logout
          </button>

        </div>

      </header>


      <div className="listings-admin-body">

        <aside className="listings-admin-sidebar">

          <p className="listings-sidebar-heading">
            ADMIN WORKSPACE
          </p>

          <nav>

            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `listings-sidebar-link ${
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
                `listings-sidebar-link ${
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
                `listings-sidebar-link ${
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
                `listings-sidebar-link ${
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
              to="/admin/contact-messages"
              className={({ isActive }) =>
                `listings-sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >

              <span>✉</span>

              Contact Messages

            </NavLink>


            <NavLink
              to="/admin/logs"
              className={({ isActive }) =>
                `listings-sidebar-link ${
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


        <main className="listings-admin-main">

          <section className="listings-admin-title">

            <div>
              <p>
                PLATFORM CONTENT
              </p>

              <h1>
                View Listings
              </h1>

              <span>
                View all HelpIn services and
                job opportunities in one place.
              </span>
            </div>

          </section>


          <section className="listings-admin-stats">

            <article className="listings-stat-card blue">
              <div>
                <p>Total Listings</p>

                <strong>
                  {loading
                    ? "..."
                    : allListings.length}
                </strong>

                <span>
                  All platform content
                </span>
              </div>

              <div className="listings-stat-icon blue">
                ▣
              </div>
            </article>


            <article className="listings-stat-card green">
              <div>
                <p>Services</p>

                <strong>
                  {loading
                    ? "..."
                    : formattedServices.length}
                </strong>

                <span>
                  Support listings
                </span>
              </div>

              <div className="listings-stat-icon green">
                🏠
              </div>
            </article>


            <article className="listings-stat-card purple">
              <div>
                <p>Jobs</p>

                <strong>
                  {loading
                    ? "..."
                    : formattedJobs.length}
                </strong>

                <span>
                  Employment listings
                </span>
              </div>

              <div className="listings-stat-icon purple">
                💼
              </div>
            </article>

          </section>


          <section className="listings-card">

            <div className="listings-card-header">

              <div>
                <p>
                  ALL LISTINGS
                </p>

                <h2>
                  Platform Listings
                </h2>

                <span>
                  Browse services and jobs
                  currently available on HelpIn.
                </span>
              </div>

              <div className="listings-result-count">
                {loading
                  ? "Loading..."
                  : `${filteredListings.length} ${
                      filteredListings.length ===
                      1
                        ? "result"
                        : "results"
                    }`}
              </div>

            </div>


            <div className="listings-filters">

              <div className="listings-search">
                <span>⌕</span>

                <input
                  id="listings-search"
                  name="listingsSearch"
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search listings..."
                />
              </div>


              <select
                id="listing-type-filter"
                name="listingTypeFilter"
                value={listingFilter}
                onChange={(event) =>
                  setListingFilter(
                    event.target.value
                  )
                }
              >
                <option value="All">
                  All Listing Types
                </option>

                <option value="Service">
                  Services
                </option>

                <option value="Job">
                  Jobs
                </option>
              </select>


              <select
                id="listing-status-filter"
                name="listingStatusFilter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
              >
                <option value="All">
                  All Statuses
                </option>

                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>
              </select>

            </div>


            <div className="listings-table-wrapper">

              <table className="listings-table">

                <thead>
                  <tr>
                    <th>LISTING</th>
                    <th>TYPE</th>
                    <th>CATEGORY</th>
                    <th>LOCATION</th>
                    <th>DETAIL</th>
                    <th>VALUE</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>


                <tbody>

                  {loading && (
                    <tr>
                      <td
                        colSpan="8"
                        className="listings-empty"
                      >
                        Loading listings from AWS...
                      </td>
                    </tr>
                  )}


                  {!loading &&
                    error && (
                    <tr>
                      <td
                        colSpan="8"
                        className="listings-empty"
                      >
                        {error}
                      </td>
                    </tr>
                  )}


                  {!loading &&
                    !error &&
                    filteredListings.length ===
                      0 && (
                    <tr>
                      <td
                        colSpan="8"
                        className="listings-empty"
                      >
                        No listings found.
                      </td>
                    </tr>
                  )}


                  {!loading &&
                    !error &&
                    filteredListings.map(
                      (item) => (
                        <tr
                          key={`${item.listingType}-${item.id}`}
                        >

                          <td>
                            <div className="listings-name-cell">

                              <div
                                className={`listings-name-icon ${
                                  item.listingType ===
                                  "Service"
                                    ? "service"
                                    : "job"
                                }`}
                              >
                                {item.listingType ===
                                "Service"
                                  ? item.category ===
                                    "Accommodation"
                                    ? "🏠"
                                    : "🍲"
                                  : "💼"}
                              </div>

                              <div>
                                <strong>
                                  {item.name}
                                </strong>

                                <span>
                                  ID #{item.id}
                                </span>
                              </div>

                            </div>
                          </td>


                          <td>
                            <span
                              className={`listings-type ${
                                item.listingType ===
                                "Service"
                                  ? "service"
                                  : "job"
                              }`}
                            >
                              {
                                item.listingType
                              }
                            </span>
                          </td>


                          <td>
                            {item.category}
                          </td>

                          <td>
                            {item.location}
                          </td>

                          <td>
                            {item.detail}
                          </td>

                          <td>
                            <strong className="listings-value">
                              {item.value}
                            </strong>
                          </td>

                          <td>
                            <span
                              className={`listings-status ${
                                String(
                                  item.status
                                ).toLowerCase() ===
                                "active"
                                  ? "active"
                                  : "inactive"
                              }`}
                            >
                              <i />
                              {item.status}
                            </span>
                          </td>

                          <td>
                            <Link
                              to={item.editUrl}
                              className="listings-manage-button"
                            >
                              Manage
                            </Link>
                          </td>

                        </tr>
                      )
                    )}

                </tbody>

              </table>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}


export default ViewListings;