import { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./FoodSupport.css";

const foodSupportData = [
  {
    id: 4,
    name: "Hope Community Food Bank",
    location: "London",
    serviceType: "Food Bank",
    cost: "Free",
    description:
      "Provides essential food parcels and everyday groceries for individuals and families who need support.",
    icon: "🥫",
  },
  {
    id: 5,
    name: "St. Mary's Community Kitchen",
    location: "Birmingham",
    serviceType: "Community Kitchen",
    cost: "Free",
    description:
      "A welcoming community kitchen providing prepared meals and local support in a friendly environment.",
    icon: "🍲",
  },
  {
    id: 6,
    name: "Good Food Hub",
    location: "Leeds",
    serviceType: "Discounted Food",
    cost: "Low Cost",
    description:
      "Find affordable food and discounted grocery options designed to help reduce everyday food costs.",
    icon: "🥗",
  },
];

function FoodSupport() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [location, setLocation] = useState("");
  const [serviceType, setServiceType] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    location: "",
    serviceType: "",
  });

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleSearch = () => {
    setAppliedFilters({
      location,
      serviceType,
    });
  };

  const handleClearFilters = () => {
    setLocation("");
    setServiceType("");

    setAppliedFilters({
      location: "",
      serviceType: "",
    });
  };

  const filteredServices = useMemo(() => {
    return foodSupportData.filter((item) => {
      const locationMatches =
        !appliedFilters.location ||
        item.location
          .toLowerCase()
          .includes(appliedFilters.location.toLowerCase());

      const typeMatches =
        !appliedFilters.serviceType ||
        item.serviceType === appliedFilters.serviceType;

      return locationMatches && typeMatches;
    });
  }, [appliedFilters]);

  return (
    <div className="food-page">

      {/* ================= NAVBAR ================= */}

      <header className="food-navbar">

        <Link
          to="/"
          className="food-logo"
          onClick={closeMenu}
        >
          HelpIn
        </Link>

        <nav className="food-nav-links">

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `food-nav-link ${isActive ? "active" : ""}`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/accommodation"
            className={({ isActive }) =>
              `food-nav-link ${isActive ? "active" : ""}`
            }
          >
            Accommodation
          </NavLink>

          <NavLink
            to="/food-support"
            className={({ isActive }) =>
              `food-nav-link ${isActive ? "active" : ""}`
            }
          >
            Food Support
          </NavLink>

          <NavLink
            to="/jobs"
            className={({ isActive }) =>
              `food-nav-link ${isActive ? "active" : ""}`
            }
          >
            Jobs
          </NavLink>

          <NavLink
            to="/recommendations"
            className={({ isActive }) =>
              `food-nav-link ${isActive ? "active" : ""}`
            }
          >
            Recommendations
          </NavLink>

        </nav>

        <NavLink
          to="/login"
          className="food-login food-desktop-login"
        >
          Login
        </NavLink>

        {/* MOBILE BUTTON */}

        <button
          className="food-menu-button"
          type="button"
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
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
          <nav className="food-mobile-nav">

            <NavLink
              to="/"
              end
              onClick={closeMenu}
              className={({ isActive }) =>
                `food-mobile-link ${
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
                `food-mobile-link ${
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
                `food-mobile-link ${
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
                `food-mobile-link ${
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
                `food-mobile-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              Recommendations
            </NavLink>

            <NavLink
              to="/login"
              onClick={closeMenu}
              className="food-mobile-login"
            >
              Login
            </NavLink>

          </nav>
        )}

      </header>


      <main>

        {/* ================= PAGE HEADING ================= */}

        <section className="food-heading-section">

          <div className="food-container">

            <div className="food-title-row">

              <div className="food-title-icon">
                🍲
              </div>

              <div>
                <h1>
                  Food Support
                </h1>

                <p>
                  Access food banks, community kitchens
                  and more.
                </p>
              </div>

            </div>

          </div>

        </section>


        {/* ================= FILTERS ================= */}

        <section className="food-search-section">

          <div className="food-filter-card">

            {/* LOCATION */}

            <div className="food-filter-field">

              <label htmlFor="food-location">
                Location
              </label>

              <div className="food-location-input">

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
                  id="food-location"
                  type="text"
                  list="food-locations"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  placeholder="Search location"
                />

                <datalist id="food-locations">
                  <option value="London" />
                  <option value="Birmingham" />
                  <option value="Manchester" />
                  <option value="Leeds" />
                </datalist>

              </div>

            </div>


            {/* SERVICE TYPE */}

            <div className="food-filter-field">

              <label htmlFor="food-service-type">
                Service Type
              </label>

              <select
                id="food-service-type"
                value={serviceType}
                onChange={(event) =>
                  setServiceType(event.target.value)
                }
              >
                <option value="">
                  All Service Types
                </option>

                <option value="Food Bank">
                  Food Bank
                </option>

                <option value="Community Kitchen">
                  Community Kitchen
                </option>

                <option value="Discounted Food">
                  Discounted Food
                </option>
              </select>

            </div>


            {/* SEARCH */}

            <button
              type="button"
              className="food-search-button"
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


        {/* ================= RESULTS ================= */}

        <section className="food-results-section">

          <div className="food-results-header">

            <div>

              <p className="food-results-label">
                FOOD SUPPORT SERVICES
              </p>

              <h2>
                Support available near you
              </h2>

              <p className="food-result-count">
                {filteredServices.length}{" "}
                {filteredServices.length === 1
                  ? "result"
                  : "results"}{" "}
                found
              </p>

            </div>


            {(appliedFilters.location ||
              appliedFilters.serviceType) && (
              <button
                type="button"
                className="food-clear-button"
                onClick={handleClearFilters}
              >
                Clear filters
              </button>
            )}

          </div>


          {filteredServices.length === 0 ? (

            <div className="food-no-results">

              <div className="food-no-results-icon">
                🍲
              </div>

              <h3>
                No food support services found
              </h3>

              <p>
                Try changing your location or service
                type.
              </p>

              <button
                type="button"
                onClick={handleClearFilters}
              >
                Clear filters
              </button>

            </div>

          ) : (

            <div className="food-list">

              {filteredServices.map((service) => (

                <article
                  key={service.id}
                  className="food-service-card"
                >

                  {/* IMAGE / ILLUSTRATION */}

                  <div className="food-card-image">

                    <div className="food-card-icon">
                      {service.icon}
                    </div>

                  </div>


                  {/* CONTENT */}

                  <div className="food-card-content">

                    <div className="food-card-heading">

                      <div>

                        <span className="food-service-tag">
                          {service.serviceType}
                        </span>

                        <h3>
                          {service.name}
                        </h3>

                      </div>


                      <span
                        className={
                          service.cost === "Free"
                            ? "food-cost food-cost-free"
                            : "food-cost"
                        }
                      >
                        {service.cost}
                      </span>

                    </div>


                    <div className="food-meta">

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
                        {service.location}
                      </span>

                    </div>


                    <p className="food-description">
                      {service.description}
                    </p>


                    <Link
                      to={`/services/${service.id}`}
                      className="food-view-button"
                    >
                      View Details
                      <span>→</span>
                    </Link>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </main>


      {/* ================= FOOTER ================= */}

      <footer className="food-footer">

        <div className="food-footer-brand">

          <h2>
            HelpIn
          </h2>

          <p>
            Helping newcomers find essential
            support in one simple place.
          </p>

        </div>


        <div className="food-footer-column">

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


        <div className="food-footer-column">

          <h4>
            Support
          </h4>

          <Link to="/recommendations">
            Recommendations
          </Link>

          <span>
            Accessibility
          </span>

          <span>
            Contact HelpIn
          </span>

        </div>

      </footer>


      <div className="food-copyright">
        © 2026 HelpIn. All rights reserved.
      </div>

    </div>
  );
}

export default FoodSupport;