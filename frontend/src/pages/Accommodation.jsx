import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { getServices } from "../services/api";
import "./Accommodation.css";


function Accommodation() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [accommodationData, setAccommodationData] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [propertyType, setPropertyType] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    location: "",
    budget: "",
    propertyType: "",
  });


  useEffect(() => {
    let active = true;

    async function loadAccommodation() {
      try {
        setLoading(true);
        setLoadError("");

        const response =
          await getServices();

        const services =
          Array.isArray(response)
            ? response
            : response?.services || [];

        const accommodation =
          services
            .filter(
              (service) =>
                service.category ===
                "Accommodation"
            )
            .map((service) => ({
              id: service.id,
              name: service.name || "",
              location:
                service.location || "",
              price:
                Number(service.price) || 0,
              propertyType:
                service.service_type ||
                "Accommodation",
              costType:
                service.cost_type ||
                "Per Month",
              description:
                service.description || "",
              imageUrl:
                service.image_url || "",
            }));

        if (active) {
          setAccommodationData(
            accommodation
          );
        }
      } catch (error) {
        console.error(
          "Unable to load accommodation:",
          error
        );

        if (active) {
          setLoadError(
            "Unable to load accommodation right now."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAccommodation();

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
      budget,
      propertyType,
    });
  };


  const handleClearFilters = () => {
    setLocation("");
    setBudget("");
    setPropertyType("");

    setAppliedFilters({
      location: "",
      budget: "",
      propertyType: "",
    });
  };


  const filteredAccommodation = useMemo(() => {
    return accommodationData.filter((item) => {
      const locationMatches =
        !appliedFilters.location ||
        item.location
          .toLowerCase()
          .includes(
            appliedFilters.location.toLowerCase()
          );

      const budgetMatches =
        !appliedFilters.budget ||
        item.price <= Number(appliedFilters.budget);

      const propertyMatches =
        !appliedFilters.propertyType ||
        item.propertyType ===
          appliedFilters.propertyType;

      return (
        locationMatches &&
        budgetMatches &&
        propertyMatches
      );
    });
  }, [appliedFilters]);


  return (
    <div className="accommodation-page">

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <header className="accommodation-navbar">

        <Link
          to="/"
          className="accommodation-logo"
          onClick={closeMenu}
        >
          HelpIn
        </Link>


        {/* DESKTOP LINKS */}

        <nav className="accommodation-nav-links">

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `accommodation-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            Home
          </NavLink>


          <NavLink
            to="/accommodation"
            className={({ isActive }) =>
              `accommodation-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            Accommodation
          </NavLink>


          <NavLink
            to="/food-support"
            className={({ isActive }) =>
              `accommodation-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            Food Support
          </NavLink>


          <NavLink
            to="/jobs"
            className={({ isActive }) =>
              `accommodation-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            Jobs
          </NavLink>


          <NavLink
            to="/recommendations"
            className={({ isActive }) =>
              `accommodation-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            Recommendations
          </NavLink>

        </nav>


        <NavLink
          to="/login"
          className="accommodation-login desktop-accommodation-login"
        >
          Login
        </NavLink>


        {/* MOBILE BUTTON */}

        <button
          type="button"
          className="accommodation-menu-button"
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


        {/* MOBILE MENU */}

        {menuOpen && (
          <nav className="accommodation-mobile-nav">

            <NavLink
              to="/"
              end
              onClick={closeMenu}
              className={({ isActive }) =>
                `accommodation-mobile-link ${
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
                `accommodation-mobile-link ${
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
                `accommodation-mobile-link ${
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
                `accommodation-mobile-link ${
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
                `accommodation-mobile-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              Recommendations
            </NavLink>


            <NavLink
              to="/login"
              onClick={closeMenu}
              className="accommodation-mobile-login"
            >
              Login
            </NavLink>

          </nav>
        )}

      </header>


      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <main>

        <section className="accommodation-heading-section">

          <div className="accommodation-heading-inner">

            <div className="accommodation-title-row">

              <div className="accommodation-title-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 11L12 4L21 11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M5.5 10V20H18.5V10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M9.5 20V14H14.5V20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>


              <div>
                <h1>
                  Accommodation
                </h1>

                <p>
                  Find safe and affordable housing
                  options.
                </p>
              </div>

            </div>

          </div>

        </section>


        {/* ==================================================
            FILTER AREA
        ================================================== */}

        <section className="accommodation-search-section">

          <div className="accommodation-filter-card">

            {/* LOCATION */}

            <div className="accommodation-filter-field">

              <label htmlFor="accommodation-location">
                Location
              </label>

              <div className="accommodation-input-wrapper">

                <svg
                  viewBox="0 0 24 24"
                  className="filter-icon"
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
                  id="accommodation-location"
                  type="text"
                  list="accommodation-locations"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  placeholder="Search location"
                />

                <datalist id="accommodation-locations">
                  <option value="London" />
                  <option value="Birmingham" />
                  <option value="Manchester" />
                  <option value="Leeds" />
                </datalist>

              </div>

            </div>


            {/* BUDGET */}

            <div className="accommodation-filter-field">

              <label htmlFor="accommodation-budget">
                Maximum Budget
              </label>

              <div className="accommodation-budget-wrapper">

                <span>£</span>

                <input
                  id="accommodation-budget"
                  type="number"
                  min="0"
                  step="1"
                  value={budget}
                  onChange={(event) =>
                    setBudget(event.target.value)
                  }
                  placeholder="e.g. 600"
                />

              </div>

            </div>


            {/* PROPERTY TYPE */}

            <div className="accommodation-filter-field">

              <label htmlFor="property-type">
                Property Type
              </label>

              <select
                id="property-type"
                value={propertyType}
                onChange={(event) =>
                  setPropertyType(event.target.value)
                }
              >
                <option value="">
                  All Property Types
                </option>

                <option value="Shared Room">
                  Shared Room
                </option>

                <option value="Studio">
                  Studio
                </option>

                <option value="Private Room">
                  Private Room
                </option>
              </select>

            </div>


            {/* SEARCH BUTTON */}

            <button
              type="button"
              className="accommodation-search-button"
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

        <section className="accommodation-results-section">

          <div className="accommodation-results-header">

            <div>
              <p className="accommodation-results-label">
                AVAILABLE ACCOMMODATION
              </p>

              <h2>
                Places you may find useful
              </h2>

              <p className="accommodation-result-count">
                {filteredAccommodation.length}{" "}
                {filteredAccommodation.length === 1
                  ? "result"
                  : "results"}{" "}
                found
              </p>
            </div>


            {(appliedFilters.location ||
              appliedFilters.budget ||
              appliedFilters.propertyType) && (
              <button
                type="button"
                className="clear-filter-button"
                onClick={handleClearFilters}
              >
                Clear filters
              </button>
            )}

          </div>


          {/* NO RESULTS */}

          {loading ? (

            <div className="no-accommodation-results">
              <h3>
                Loading accommodation...
              </h3>
            </div>

          ) : loadError ? (

            <div className="no-accommodation-results">
              <h3>
                {loadError}
              </h3>
            </div>

          ) : filteredAccommodation.length === 0 ? (

            <div className="no-accommodation-results">

              <div className="no-results-icon">
                🏠
              </div>

              <h3>
                No accommodation found
              </h3>

              <p>
                Try changing your location, budget
                or property type.
              </p>

              <button
                type="button"
                onClick={handleClearFilters}
              >
                Clear filters
              </button>

            </div>

          ) : (

            <div className="accommodation-list">

              {filteredAccommodation.map((item) => (

                <article
                  key={item.id}
                  className="accommodation-card"
                >

                  {/* IMAGE */}

                  <div className="accommodation-card-image">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="accommodation-uploaded-image"
                      />
                    ) : (
                      <div className="building-illustration">
                        <span className="building-main">
                          🏢
                        </span>

                        <span className="building-home">
                          🏠
                        </span>
                      </div>
                    )}
                  </div>


                  {/* INFORMATION */}

                  <div className="accommodation-card-content">

                    <div className="accommodation-card-top">

                      <div>

                        <span className="accommodation-type-tag">
                          Accommodation
                        </span>

                        <h3>
                          {item.name}
                        </h3>

                      </div>

                      <div className="accommodation-price desktop-card-price">
                        <strong>
                          {item.costType === "Free" ||
                          item.price === 0
                            ? "Free"
                            : `£${item.price}`}
                        </strong>

                        {item.costType !== "Free" &&
                          item.price !== 0 && (
                            <span>
                              {item.costType === "Per Month"
                                ? "/ month"
                                : item.costType === "Per Week"
                                  ? "/ week"
                                  : item.costType === "Per Day"
                                    ? "/ day"
                                    : item.costType}
                            </span>
                          )}
                      </div>

                    </div>


                    <div className="accommodation-meta">

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
                          {item.location}
                        </span>

                      </div>


                      <div>

                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M4 8.5H20V19H4V8.5Z"
                            stroke="currentColor"
                            strokeWidth="2"
                          />

                          <path
                            d="M7 8.5V6H17V8.5"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>

                        <span>
                          {item.propertyType}
                        </span>

                      </div>

                    </div>


                    <p className="accommodation-description">
                      {item.description}
                    </p>


                    <div className="accommodation-mobile-price">
                      <strong>
                        {item.costType === "Free" ||
                        item.price === 0
                          ? "Free"
                          : `£${item.price}`}
                      </strong>

                      {item.costType !== "Free" &&
                        item.price !== 0 && (
                          <span>
                            {item.costType === "Per Month"
                              ? "/ month"
                              : item.costType === "Per Week"
                                ? "/ week"
                                : item.costType === "Per Day"
                                  ? "/ day"
                                  : item.costType}
                          </span>
                        )}
                    </div>


                    <div className="accommodation-card-actions">

                      <Link
                        to={`/services/${item.id}`}
                        className="view-details-button"
                      >
                        View Details

                        <span>
                          →
                        </span>
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

      <footer className="accommodation-footer">

        <div className="accommodation-footer-brand">

          <h2>
            HelpIn
          </h2>

          <p>
            Helping newcomers find essential
            support in one simple place.
          </p>

        </div>


        <div className="accommodation-footer-column">

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


        <div className="accommodation-footer-column">

          <h4>
            Support
          </h4>

          <Link to="/recommendations">
            Recommendations
          </Link>

          <span>
            Accessibility
          </span>

          <Link to="/contact">
            Contact HelpIn
          </Link>

        </div>

      </footer>


      <div className="accommodation-copyright">
        © 2026 HelpIn. All rights reserved.
      </div>

    </div>
  );
}

export default Accommodation;