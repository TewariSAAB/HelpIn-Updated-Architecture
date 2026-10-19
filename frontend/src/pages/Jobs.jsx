import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { getJobs } from "../services/api";
import "./Jobs.css";


function getJobIcon(category = "") {
  const value =
    String(category).toLowerCase();

  if (value.includes("warehouse")) {
    return "📦";
  }

  if (
    value.includes("hospitality") ||
    value.includes("kitchen") ||
    value.includes("food")
  ) {
    return "👨‍🍳";
  }

  if (
    value.includes("retail") ||
    value.includes("shop")
  ) {
    return "🛍️";
  }

  if (
    value.includes("clean") ||
    value.includes("maintenance")
  ) {
    return "🧹";
  }

  if (
    value.includes("care") ||
    value.includes("support")
  ) {
    return "🤝";
  }

  return "💼";
}



function Jobs() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [jobsData, setJobsData] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    location: "",
    jobType: "",
  });



  useEffect(() => {
    let active = true;

    async function loadJobs() {
      try {
        setLoading(true);
        setLoadError("");

        const response =
          await getJobs();

        const jobs =
          Array.isArray(response)
            ? response
            : response?.jobs || [];

        const formattedJobs =
          jobs.map((job) => ({
            id: job.id,
            title:
              job.title || "",
            company:
              job.company || "",
            location:
              job.location || "",
            jobType:
              job.job_type ||
              job.jobType ||
              "",
            pay:
              job.pay || "Pay not specified",
            experience:
              job.experience_requirement ||
              job.experienceRequirement ||
              "Experience requirement not specified",
            category:
              job.category || "Job",
            description:
              job.description || "",
            externalUrl:
              job.external_url ||
              job.externalUrl ||
              "",
            icon:
              getJobIcon(
                job.category
              ),
          }));

        if (active) {
          setJobsData(
            formattedJobs
          );
        }
      } catch (error) {
        console.error(
          "Unable to load jobs:",
          error
        );

        if (active) {
          setLoadError(
            "Unable to load jobs right now."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      active = false;
    };
  }, []);


  const closeMenu = () => {
    setMenuOpen(false);
  };


  const handleSearch = () => {
    setAppliedFilters({
      location,
      jobType,
    });
  };


  const handleClearFilters = () => {
    setLocation("");
    setJobType("");

    setAppliedFilters({
      location: "",
      jobType: "",
    });
  };


  const filteredJobs = useMemo(() => {
    return jobsData.filter((job) => {
      const locationMatches =
        !appliedFilters.location ||
        job.location
          .toLowerCase()
          .includes(
            appliedFilters.location.toLowerCase()
          );

      const typeMatches =
        !appliedFilters.jobType ||
        job.jobType === appliedFilters.jobType;

      return locationMatches && typeMatches;
    });
  }, [jobsData, appliedFilters]);


  return (
    <div className="jobs-page">

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <header className="jobs-navbar">

        <Link
          to="/"
          className="jobs-logo"
          onClick={closeMenu}
        >
          HelpIn
        </Link>


        {/* DESKTOP NAVIGATION */}

        <nav className="jobs-nav-links">

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `jobs-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            Home
          </NavLink>


          <NavLink
            to="/accommodation"
            className={({ isActive }) =>
              `jobs-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            Accommodation
          </NavLink>


          <NavLink
            to="/food-support"
            className={({ isActive }) =>
              `jobs-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            Food Support
          </NavLink>


          <NavLink
            to="/jobs"
            className={({ isActive }) =>
              `jobs-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            Jobs
          </NavLink>


          <NavLink
            to="/recommendations"
            className={({ isActive }) =>
              `jobs-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            Recommendations
          </NavLink>

        </nav>


        <NavLink
          to="/login"
          className="jobs-login jobs-desktop-login"
        >
          Login
        </NavLink>


        {/* MOBILE MENU BUTTON */}

        <button
          type="button"
          className="jobs-menu-button"
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          onClick={() =>
            setMenuOpen((open) => !open)
          }
        >
          {menuOpen ? (
            <svg viewBox="0 0 24 24">
              <path
                d="M6 6L18 18M18 6L6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24">
              <path
                d="M4 7H20M4 12H20M4 17H20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>


        {/* MOBILE NAVIGATION */}

        {menuOpen && (
          <nav className="jobs-mobile-nav">

            <NavLink
              to="/"
              end
              onClick={closeMenu}
              className={({ isActive }) =>
                `jobs-mobile-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              Home
            </NavLink>


            <NavLink
              to="/accommodation"
              onClick={closeMenu}
              className={({ isActive }) =>
                `jobs-mobile-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              Accommodation
            </NavLink>


            <NavLink
              to="/food-support"
              onClick={closeMenu}
              className={({ isActive }) =>
                `jobs-mobile-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              Food Support
            </NavLink>


            <NavLink
              to="/jobs"
              onClick={closeMenu}
              className={({ isActive }) =>
                `jobs-mobile-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              Jobs
            </NavLink>


            <NavLink
              to="/recommendations"
              onClick={closeMenu}
              className={({ isActive }) =>
                `jobs-mobile-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              Recommendations
            </NavLink>


            <NavLink
              to="/login"
              onClick={closeMenu}
              className="jobs-mobile-login"
            >
              Login
            </NavLink>

          </nav>
        )}

      </header>


      <main>

        {/* ==================================================
            PAGE HEADING
        ================================================== */}

        <section className="jobs-heading-section">

          <div className="jobs-container">

            <div className="jobs-title-row">

              <div className="jobs-title-icon">
                💼
              </div>

              <div>

                <h1>
                  Jobs
                </h1>

                <p>
                  Find beginner-friendly job
                  opportunities.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* ==================================================
            FILTERS
        ================================================== */}

        <section className="jobs-search-section">

          <div className="jobs-filter-card">

            {/* LOCATION */}

            <div className="jobs-filter-field">

              <label htmlFor="jobs-location">
                Location
              </label>

              <div className="jobs-location-input">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 21C12 21 18 15.5 18 10A6 6 0 1 0 6 10C6 15.5 12 21 12 21Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />

                  <circle
                    cx="12"
                    cy="10"
                    r="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>

                <input
                  id="jobs-location"
                  type="text"
                  list="jobs-locations"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  placeholder="Search location"
                />

                <datalist id="jobs-locations">
                  <option value="London" />
                  <option value="Birmingham" />
                  <option value="Manchester" />
                  <option value="Leeds" />
                </datalist>

              </div>

            </div>


            {/* JOB TYPE */}

            <div className="jobs-filter-field">

              <label htmlFor="jobs-type">
                Job Type
              </label>

              <select
                id="jobs-type"
                value={jobType}
                onChange={(event) =>
                  setJobType(event.target.value)
                }
              >
                <option value="">
                  All Job Types
                </option>

                <option value="Full-time">
                  Full-time
                </option>

                <option value="Part-time">
                  Part-time
                </option>

                <option value="Temporary">
                  Temporary
                </option>

                <option value="Flexible">
                  Flexible
                </option>

              </select>

            </div>


            {/* SEARCH BUTTON */}

            <button
              type="button"
              className="jobs-search-button"
              onClick={handleSearch}
            >

              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="10.5"
                  cy="10.5"
                  r="6.5"
                  stroke="currentColor"
                  strokeWidth="2"
                />

                <path
                  d="M15.5 15.5L21 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              Search

            </button>

          </div>

        </section>


        {/* ==================================================
            RESULTS
        ================================================== */}

        <section className="jobs-results-section">

          <div className="jobs-results-header">

            <div>

              <p className="jobs-results-label">
                AVAILABLE OPPORTUNITIES
              </p>

              <h2>
                Jobs you may find useful
              </h2>

              <p className="jobs-result-count">
                {filteredJobs.length}{" "}
                {filteredJobs.length === 1
                  ? "job"
                  : "jobs"}{" "}
                found
              </p>

            </div>


            {(appliedFilters.location ||
              appliedFilters.jobType) && (
              <button
                type="button"
                className="jobs-clear-button"
                onClick={handleClearFilters}
              >
                Clear filters
              </button>
            )}

          </div>


          {/* NO RESULTS */}

          {loading ? (

            <div className="jobs-no-results">

              <div className="jobs-no-results-icon">
                ⌛
              </div>

              <h3>
                Loading jobs...
              </h3>

              <p>
                Fetching the latest opportunities.
              </p>

            </div>

          ) : loadError ? (

            <div className="jobs-no-results">

              <div className="jobs-no-results-icon">
                ⚠
              </div>

              <h3>
                Unable to load jobs
              </h3>

              <p>
                {loadError}
              </p>

            </div>

          ) : filteredJobs.length === 0 ? (

            <div className="jobs-no-results">

              <div className="jobs-no-results-icon">
                💼
              </div>

              <h3>
                No jobs found
              </h3>

              <p>
                Try changing your location or
                job type.
              </p>

              <button
                type="button"
                onClick={handleClearFilters}
              >
                Clear filters
              </button>

            </div>

          ) : (

            <div className="jobs-list">

              {filteredJobs.map((job) => (

                <article
                  key={job.id}
                  className="jobs-card"
                >

                  {/* JOB IMAGE */}

                  <div className="jobs-card-image">

                    <div className="jobs-card-icon">
                      {job.icon}
                    </div>

                  </div>


                  {/* JOB INFORMATION */}

                  <div className="jobs-card-content">

                    <div className="jobs-card-heading">

                      <div>

                        <span className="jobs-category-tag">
                          {job.category}
                        </span>

                        <h3>
                          {job.title}
                        </h3>

                        <p className="jobs-company">
                          {job.company}
                        </p>

                      </div>


                      <div className="jobs-pay">
                        {job.pay}
                      </div>

                    </div>


                    {/* META */}

                    <div className="jobs-meta">

                      <div>

                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 21C12 21 18 15.5 18 10A6 6 0 1 0 6 10C6 15.5 12 21 12 21Z"
                            stroke="currentColor"
                            strokeWidth="2"
                          />

                          <circle
                            cx="12"
                            cy="10"
                            r="2"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>

                        <span>
                          {job.location}
                        </span>

                      </div>


                      <div>

                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <rect
                            x="4"
                            y="7"
                            width="16"
                            height="12"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="2"
                          />

                          <path
                            d="M9 7V5H15V7"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>

                        <span>
                          {job.jobType}
                        </span>

                      </div>

                    </div>


                    <div className="jobs-experience">
                      ✓ {job.experience}
                    </div>


                    <p className="jobs-description">
                      {job.description}
                    </p>


                    <div className="jobs-card-actions">

                      <Link
                        to={`/jobs/${job.id}`}
                        className="jobs-view-button"
                      >
                        View Details
                        <span>→</span>
                     </Link>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </main>


      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="jobs-footer">

        <div className="jobs-footer-brand">

          <h2>
            HelpIn
          </h2>

          <p>
            Helping newcomers find essential
            support in one simple place.
          </p>

        </div>


        <div className="jobs-footer-column">

          <h4>
            Quick Links
          </h4>

          <Link to="/">
            Home
          </Link>

          <Link to="/accommodation">
            Accommodation
          </Link>

          <Link to="/food-support">
            Food Support
          </Link>

          <Link to="/jobs">
            Jobs
          </Link>

        </div>


        <div className="jobs-footer-column">

          <h4>
            Support
          </h4>

          <Link to="/recommendations">
            Recommendations
          </Link>

          <span>
            Accessibility
          </span>

          <a href="https://mail.google.com/mail/?view=cm&fs=1&to=dhruvtewari99%40gmail.com&su=HelpIn%20Enquiry"
            target="_blank"
            rel="noreferrer">
            Contact HelpIn
          </a>

        </div>

      </footer>


      <div className="jobs-copyright">
        © 2026 HelpIn. All rights reserved.
      </div>

    </div>
  );
}

export default Jobs;