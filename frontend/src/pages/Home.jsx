import { useState } from "react";

import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import heroImage from "../assets/helpin.png";

import "./Home.css";


function Home() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [location, setLocation] =
    useState("");

  const [budget, setBudget] =
    useState("");

  const [category, setCategory] =
    useState("");


  /* ======================================================
     MOBILE MENU
  ====================================================== */

  const closeMenu = () => {
    setMenuOpen(false);
  };


  /* ======================================================
     HOME SEARCH
  ====================================================== */

  const handleSearch = (event) => {
    event.preventDefault();


    const params =
      new URLSearchParams();


    /* SEARCH TEXT */

    if (searchTerm.trim()) {
      params.set(
        "search",
        searchTerm.trim()
      );
    }


    /* LOCATION */

    if (location.trim()) {
      params.set(
        "location",
        location.trim()
      );
    }


    /* BUDGET */

    if (budget) {
      params.set(
        "budget",
        budget
      );
    }


    /* CATEGORY */

    if (category) {
      params.set(
        "category",
        category
      );
    }


    const queryString =
      params.toString();


    /* ================================================
       CHOOSE DESTINATION
    ================================================ */

    let destination =
      "/recommendations";


    if (
      category ===
      "Accommodation"
    ) {
      destination =
        "/accommodation";
    }


    if (
      category ===
      "Food Support"
    ) {
      destination =
        "/food-support";
    }


    if (
      category ===
      "Jobs"
    ) {
      destination =
        "/jobs";
    }


    navigate(
      queryString
        ? `${destination}?${queryString}`
        : destination
    );
  };


  return (
    <div className="home-page">

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <header className="navbar">

        {/* LOGO */}

        <Link
          to="/"
          className="logo"
          onClick={closeMenu}
        >
          HelpIn
        </Link>


        {/* DESKTOP NAVIGATION */}

        <nav className="nav-links">

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-link ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >
            Home
          </NavLink>


          <NavLink
            to="/accommodation"
            className={({ isActive }) =>
              `nav-link ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >
            Accommodation
          </NavLink>


          <NavLink
            to="/food-support"
            className={({ isActive }) =>
              `nav-link ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >
            Food Support
          </NavLink>


          <NavLink
            to="/jobs"
            className={({ isActive }) =>
              `nav-link ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >
            Jobs
          </NavLink>


          <NavLink
            to="/recommendations"
            className={({ isActive }) =>
              `nav-link ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >
            Recommendations
          </NavLink>

        </nav>


        {/* DESKTOP LOGIN */}

        <NavLink
          to="/login"
          className="login-button desktop-login"
        >
          Login
        </NavLink>


        {/* MOBILE MENU BUTTON */}

        <button
          className="mobile-menu-button"
          type="button"
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          onClick={() =>
            setMenuOpen(
              (open) =>
                !open
            )
          }
        >
          {menuOpen ? (
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M6 6L18 18M18 6L6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
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
          <nav className="mobile-nav">

            <NavLink
              to="/"
              end
              onClick={closeMenu}
              className={({ isActive }) =>
                `mobile-nav-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >
              Home
            </NavLink>


            <NavLink
              to="/accommodation"
              onClick={closeMenu}
              className={({ isActive }) =>
                `mobile-nav-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >
              Accommodation
            </NavLink>


            <NavLink
              to="/food-support"
              onClick={closeMenu}
              className={({ isActive }) =>
                `mobile-nav-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >
              Food Support
            </NavLink>


            <NavLink
              to="/jobs"
              onClick={closeMenu}
              className={({ isActive }) =>
                `mobile-nav-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >
              Jobs
            </NavLink>


            <NavLink
              to="/recommendations"
              onClick={closeMenu}
              className={({ isActive }) =>
                `mobile-nav-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >
              Recommendations
            </NavLink>


            <NavLink
              to="/login"
              onClick={closeMenu}
              className="mobile-login"
            >
              Login
            </NavLink>

          </nav>
        )}

      </header>


      {/* ==================================================
          HERO
      ================================================== */}

      <section className="hero">

        {/* DESKTOP BACKGROUND */}

        <div
          className="hero-desktop-background"
          aria-hidden="true"
        >

          <img
            src={heroImage}
            alt=""
            className="hero-background-image"
          />


          <div className="hero-desktop-overlay" />


          <div className="hero-handwritten-desktop">

            <span>
              People
            </span>

            <span>
              Support
            </span>

            <span>
              Communities
            </span>

            <span>
              Thrive
            </span>

            <span className="hero-heart">
              ♡
            </span>

          </div>

        </div>


        <div className="hero-inner">

          {/* MOBILE IMAGE */}

          <div className="hero-mobile-image">

            <img
              src={heroImage}
              alt="Family looking towards opportunities in a new city"
            />


            <p className="mobile-image-message">
              A stronger tomorrow starts
              with the right support.
            </p>


            <div className="hero-handwritten-mobile">

              <span>
                People
              </span>

              <span>
                Support
              </span>

              <span>
                Communities
              </span>

              <span>
                Thrive
              </span>

              <span className="mobile-heart">
                ♡
              </span>

            </div>

          </div>


          {/* HERO CONTENT */}

          <div className="hero-content">

            <p className="hero-label">
              Support made simpler
            </p>


            <h1>
              Find trusted{" "}
              <span>
                support
              </span>{" "}
              faster
            </h1>


            <p className="hero-description">
              HelpIn connects immigrants and refugees
              with accommodation, food support,
              job opportunities and trusted community
              resources.
            </p>


            {/* ==================================================
                SEARCH
            ================================================== */}

            <form
              className="hero-search"
              onSubmit={handleSearch}
            >

              <div className="hero-search-field">

                <svg
                  className="hero-search-icon"
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


                <input
                  id="home-search"
                  name="homeSearch"
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  placeholder="Search for services, places, or support..."
                />

              </div>


              <button
                type="submit"
              >
                Search
              </button>

            </form>


            {/* ==================================================
                FILTERS
            ================================================== */}

            <div className="quick-filters">

              {/* LOCATION */}

              <div className="filter-field">

                <label htmlFor="home-location">
                  Location
                </label>


                <input
                  id="home-location"
                  name="homeLocation"
                  type="text"
                  list="helpin-locations"
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value
                    )
                  }
                  placeholder="Search location"
                />


                <datalist id="helpin-locations">

                  <option value="London" />

                  <option value="Birmingham" />

                  <option value="Manchester" />

                  <option value="Leeds" />

                </datalist>

              </div>


              {/* BUDGET */}

              <div className="filter-field">

                <label htmlFor="home-budget">
                  Maximum Budget
                </label>


                <div className="budget-input">

                  <span>
                    £
                  </span>


                  <input
                    id="home-budget"
                    name="homeBudget"
                    type="number"
                    min="0"
                    step="1"
                    value={budget}
                    onChange={(event) =>
                      setBudget(
                        event.target.value
                      )
                    }
                    placeholder="e.g. 500"
                  />

                </div>

              </div>


              {/* CATEGORY */}

              <div className="filter-field">

                <label htmlFor="home-category">
                  Category
                </label>


                <select
                  id="home-category"
                  name="homeCategory"
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target.value
                    )
                  }
                >

                  <option value="">
                    All Categories
                  </option>


                  <option value="Accommodation">
                    Accommodation
                  </option>


                  <option value="Food Support">
                    Food Support
                  </option>


                  <option value="Jobs">
                    Jobs
                  </option>

                </select>

              </div>

            </div>


            <p className="hero-message">
              A stronger tomorrow starts with
              the right support.
            </p>

          </div>

        </div>

      </section>


      {/* ==================================================
          SERVICES
      ================================================== */}

      <section className="services-section">

        <div className="section-heading">

          <p>
            Explore HelpIn
          </p>


          <h2>
            Find the support you need
          </h2>

        </div>


        <div className="service-grid">

          {/* ACCOMMODATION */}

          <article className="service-card home-accommodation-card">

            <div className="service-icon">
              🏠
            </div>


            <h3>
              Accommodation
            </h3>


            <p>
              Find affordable accommodation
              options based on your location
              and budget.
            </p>


            <Link to="/accommodation">
              Explore Accommodation →
            </Link>

          </article>


          {/* FOOD SUPPORT */}

          <article className="service-card food-card">

            <div className="service-icon">
              🍲
            </div>


            <h3>
              Food Support
            </h3>


            <p>
              Discover food banks,
              community kitchens and other
              affordable food support.
            </p>


            <Link to="/food-support">
              Find Food Support →
            </Link>

          </article>


          {/* JOBS */}

          <article className="service-card jobs-card">

            <div className="service-icon">
              💼
            </div>


            <h3>
              Jobs
            </h3>


            <p>
              Search beginner-friendly jobs
              with simple requirements and
              flexible opportunities.
            </p>


            <Link to="/jobs">
              Browse Jobs →
            </Link>

          </article>

        </div>

      </section>


      {/* ==================================================
          RECOMMENDATIONS
      ================================================== */}

      <section className="recommendation-section">

        <div>

          <p className="recommendation-label">
            PERSONAL RECOMMENDATIONS
          </p>


          <h2>
            Find What Fits You
          </h2>


          <p>
            Tell us what you are looking for
            and HelpIn will show suitable
            services and jobs based on your
            preferences.
          </p>

        </div>


        <Link
          to="/recommendations"
          className="recommendation-button"
        >
          Get Recommendations
        </Link>

      </section>


      {/* ==================================================
          NEWS
      ================================================== */}

      <section
        className="news-section"
        id="news"
      >

        <div className="news-header">

          <div>

            <p>
              Useful information
            </p>


            <h2>
              News & Facts
            </h2>

          </div>


          <button
            type="button"
            className="view-news-button"
          >
            View all news
          </button>

        </div>


        <div className="news-grid">

          {/* NEWS CARD 1 */}

          <article className="news-card">

            <div className="news-image">
              🏙️
            </div>


            <div className="news-content">

              <span>
                Accommodation
              </span>


              <h3>
                Tips for finding affordable
                accommodation
              </h3>


              <p>
                Learn what to consider when
                searching for a place to live
                in a new area.
              </p>

            </div>

          </article>


          {/* NEWS CARD 2 */}

          <article className="news-card">

            <div className="news-image">
              🥗
            </div>


            <div className="news-content">

              <span>
                Food Support
              </span>


              <h3>
                Understanding local food support
              </h3>


              <p>
                Find out how food banks and
                community services can provide
                additional support.
              </p>

            </div>

          </article>


          {/* NEWS CARD 3 */}

          <article className="news-card">

            <div className="news-image">
              👷
            </div>


            <div className="news-content">

              <span>
                Employment
              </span>


              <h3>
                Starting your first UK job search
              </h3>


              <p>
                Explore simple steps for finding
                beginner-friendly employment
                opportunities.
              </p>

            </div>

          </article>

        </div>

      </section>


      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="footer">

        <div className="footer-brand">

          <h2>
            HelpIn
          </h2>


          <p>
            Helping newcomers find essential
            support in one simple place.
          </p>

        </div>


        <div className="footer-column">

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


        <div className="footer-column">

          <h4>
            About
          </h4>


          <a href="#about">
            About HelpIn
          </a>


          <a href="#news">
            News & Facts
          </a>


          <a href="#accessibility">
            Accessibility
          </a>

        </div>


        <div className="footer-column">

          <h4>
            Get In Touch
          </h4>


          <p>
            Contact HelpIn
          </p>


          <p>
            Support
          </p>

        </div>


        <div className="footer-column">

          <h4>
            Follow Us
          </h4>


          <p>
            LinkedIn
          </p>


          <p>
            Instagram
          </p>

        </div>

      </footer>


      <div className="copyright">
        © 2026 HelpIn. All rights reserved.
      </div>

    </div>
  );
}


export default Home;