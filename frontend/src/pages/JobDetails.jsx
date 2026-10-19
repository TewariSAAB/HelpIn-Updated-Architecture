import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useParams,
} from "react-router-dom";

import {
  getJobById,
  getJobs,
} from "../services/api";

import "./JobDetails.css";


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


function formatJob(item) {
  return {
    id:
      String(item.id),
    title:
      item.title || "",
    company:
      item.company || "",
    category:
      item.category || "Job",
    jobType:
      item.job_type ||
      item.jobType ||
      "",
    location:
      item.location || "",
    pay:
      item.pay || "Pay not specified",
    experience:
      item.experience_requirement ||
      item.experienceRequirement ||
      "Experience requirement not specified",
    description:
      item.description || "",
    icon:
      getJobIcon(
        item.category
      ),
    externalUrl:
      item.external_url ||
      item.externalUrl ||
      "",
  };
}



function JobDetails() {
  const { id } = useParams();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [job, setJob] =
    useState(null);

  const [relatedJobs, setRelatedJobs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");


  useEffect(() => {
    let active = true;

    async function loadJob() {
      try {
        setLoading(true);
        setLoadError("");

        const [
          jobResponse,
          jobsResponse,
        ] = await Promise.all([
          getJobById(id),
          getJobs(),
        ]);

        const rawJob =
          jobResponse?.job ||
          jobResponse;

        const allJobs =
          Array.isArray(jobsResponse)
            ? jobsResponse
            : jobsResponse?.jobs || [];

        if (active) {
          setJob(
            formatJob(
              rawJob
            )
          );

          setRelatedJobs(
            allJobs
              .filter(
                (item) =>
                  String(item.id) !==
                  String(rawJob.id)
              )
              .slice(0, 3)
              .map(formatJob)
          );
        }
      } catch (error) {
        console.error(
          "Unable to load job:",
          error
        );

        if (active) {
          setJob(null);
          setLoadError(
            "This job listing could not be loaded."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadJob();

    return () => {
      active = false;
    };
  }, [id]);


  const closeMenu = () => {
    setMenuOpen(false);
  };


  if (loading) {
    return (
      <div className="job-details-not-found">

        <div>

          <span>⌛</span>

          <h1>
            Loading job...
          </h1>

        </div>

      </div>
    );
  }


  if (!job || loadError) {
    return (
      <div className="job-details-not-found">

        <div>

          <span>💼</span>

          <h1>
            Job not found
          </h1>

          <p>
            {loadError ||
              "This job listing could not be found."}
          </p>

          <Link to="/jobs">
            Back to Jobs
          </Link>

        </div>

      </div>
    );
  }


  return (
    <div className="job-details-page">

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <header className="job-details-navbar">

        <Link
          to="/"
          className="job-details-logo"
          onClick={closeMenu}
        >
          HelpIn
        </Link>


        {/* DESKTOP NAV */}

        <nav className="job-details-nav-links">

          <NavLink
            to="/"
            end
            className="job-details-nav-link"
          >
            Home
          </NavLink>


          <NavLink
            to="/accommodation"
            className="job-details-nav-link"
          >
            Accommodation
          </NavLink>


          <NavLink
            to="/food-support"
            className="job-details-nav-link"
          >
            Food Support
          </NavLink>


          <NavLink
            to="/jobs"
            className="job-details-nav-link active"
          >
            Jobs
          </NavLink>


          <NavLink
            to="/recommendations"
            className="job-details-nav-link"
          >
            Recommendations
          </NavLink>

        </nav>


        <NavLink
          to="/login"
          className="job-details-login job-details-desktop-login"
        >
          Login
        </NavLink>


        {/* MOBILE MENU */}

        <button
          type="button"
          className="job-details-menu-button"
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


        {menuOpen && (
          <nav className="job-details-mobile-nav">

            <NavLink
              to="/"
              end
              onClick={closeMenu}
              className="job-details-mobile-link"
            >
              Home
            </NavLink>


            <NavLink
              to="/accommodation"
              onClick={closeMenu}
              className="job-details-mobile-link"
            >
              Accommodation
            </NavLink>


            <NavLink
              to="/food-support"
              onClick={closeMenu}
              className="job-details-mobile-link"
            >
              Food Support
            </NavLink>


            <NavLink
              to="/jobs"
              onClick={closeMenu}
              className="job-details-mobile-link active"
            >
              Jobs
            </NavLink>


            <NavLink
              to="/recommendations"
              onClick={closeMenu}
              className="job-details-mobile-link"
            >
              Recommendations
            </NavLink>


            <NavLink
              to="/login"
              onClick={closeMenu}
              className="job-details-mobile-login"
            >
              Login
            </NavLink>

          </nav>
        )}

      </header>


      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="job-details-main">

        <Link
          to="/jobs"
          className="job-details-back"
        >
          <span>←</span>

          Back to jobs
        </Link>


        <section className="job-details-layout">

          {/* ==================================================
              IMAGE
          ================================================== */}

          <div className="job-details-image">

            <div className="job-details-image-icon">
              {job.icon}
            </div>

          </div>


          {/* ==================================================
              CONTENT
          ================================================== */}

          <div className="job-details-content">

            <div className="job-details-tags">

              <span className="job-details-category">
                {job.category}
              </span>

              <span className="job-details-type">
                {job.jobType}
              </span>

            </div>


            <h1>
              {job.title}
            </h1>


            <p className="job-details-company">
              {job.company}
            </p>


            <div className="job-details-summary">

              {/* LOCATION */}

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


              {/* PAY */}

              <div>

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="2"
                  />

                  <path
                    d="M14.5 8.5C13.9 8 13.1 7.8 12.3 7.8C10.9 7.8 10 8.5 10 9.6C10 10.7 10.9 11.2 12.4 11.6C13.9 12 14.8 12.6 14.8 13.8C14.8 15 13.8 15.8 12.2 15.8C11.1 15.8 10.2 15.5 9.5 14.9"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>

                <span>
                  {job.pay}
                </span>

              </div>

            </div>


            <div className="job-details-experience">
              ✓ {job.experience}
            </div>


            <div className="job-details-description">

              <h2>
                About this job
              </h2>

              <p>
                {job.description}
              </p>

            </div>


            {/* ==================================================
                JOB INFORMATION
            ================================================== */}

            <div className="job-details-info-box">

              <div className="job-details-info-row">

                <div className="job-details-info-icon">
                  💼
                </div>

                <div>

                  <span>
                    Job Type
                  </span>

                  <strong>
                    {job.jobType}
                  </strong>

                </div>

              </div>


              <div className="job-details-info-row">

                <div className="job-details-info-icon">
                  📍
                </div>

                <div>

                  <span>
                    Location
                  </span>

                  <strong>
                    {job.location}
                  </strong>

                </div>

              </div>


              <div className="job-details-info-row">

                <div className="job-details-info-icon">
                  💷
                </div>

                <div>

                  <span>
                    Pay
                  </span>

                  <strong>
                    {job.pay}
                  </strong>

                </div>

              </div>


              <div className="job-details-info-row">

                <div className="job-details-info-icon">
                  ✓
                </div>

                <div>

                  <span>
                    Experience
                  </span>

                  <strong>
                    {job.experience}
                  </strong>

                </div>

              </div>

            </div>


            {/* ==================================================
                APPLY
            ================================================== */}

            <div className="job-details-apply-section">

              <div>

                <h3>
                  Interested in this job?
                </h3>

                <p>
                  Applications are completed on
                  the original job provider's
                  website.
                </p>

              </div>


              <a
                href={job.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="job-details-apply-button"
              >
                Apply on Original Website

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M14 5H19V10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  <path
                    d="M19 5L11 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  <path
                    d="M18 13V18C18 19.1 17.1 20 16 20H6C4.9 20 4 19.1 4 18V8C4 6.9 4.9 6 6 6H11"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>

              </a>

            </div>

          </div>

        </section>


        {/* ==================================================
            RELATED JOBS
        ================================================== */}

        <section className="job-details-related">

          <div className="job-details-related-header">

            <div>

              <p>
                MORE OPPORTUNITIES
              </p>

              <h2>
                Related Jobs
              </h2>

            </div>


            <Link to="/jobs">
              View all →
            </Link>

          </div>


          <div className="job-details-related-grid">

            {relatedJobs.map((item) => (

              <Link
                key={item.id}
                to={`/jobs/${item.id}`}
                className="job-details-related-card"
              >

                <div className="job-details-related-image">

                  <span>
                    {item.icon}
                  </span>

                </div>


                <div className="job-details-related-content">

                  <span className="job-details-related-category">
                    {item.category}
                  </span>

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.company}
                  </p>


                  <div className="job-details-related-meta">

                    <span>
                      {item.location}
                    </span>

                    <strong>
                      {item.pay}
                    </strong>

                  </div>

                </div>

              </Link>

            ))}

          </div>

        </section>

      </main>


      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="job-details-footer">

        <div className="job-details-footer-brand">

          <h2>
            HelpIn
          </h2>

          <p>
            Helping newcomers find essential
            support in one simple place.
          </p>

        </div>


        <div className="job-details-footer-column">

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


        <div className="job-details-footer-column">

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


      <div className="job-details-copyright">
        © 2026 HelpIn. All rights reserved.
      </div>

    </div>
  );
}

export default JobDetails;