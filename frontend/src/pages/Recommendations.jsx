import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Recommendations.css";


const recommendationData = [
  {
    id: 1,
    targetId: 1,
    title: "Riverside Apartments",
    category: "Accommodation",
    location: "London",
    price: 600,
    serviceType: "Accommodation",
    description:
      "Affordable shared accommodation with useful transport links and essential local services.",
    icon: "🏠",
  },

  {
    id: 2,
    targetId: 4,
    title: "Hope Community Food Bank",
    category: "Food Support",
    location: "London",
    price: 0,
    serviceType: "Food Support",
    description:
      "Free food parcels and grocery support for individuals and families who need additional help.",
    icon: "🥫",
  },

  {
    id: 3,
    targetId: 1,
    title: "Warehouse Assistant",
    category: "Jobs",
    location: "London",
    price: 0,
    serviceType: "Jobs",
    description:
      "A beginner-friendly full-time warehouse opportunity with no previous experience required.",
    icon: "📦",
  },

  {
    id: 4,
    targetId: 5,
    title: "St. Mary's Community Kitchen",
    category: "Food Support",
    location: "Birmingham",
    price: 0,
    serviceType: "Food Support",
    description:
      "Community meals and food support in a welcoming local environment.",
    icon: "🍲",
  },

  {
    id: 5,
    targetId: 2,
    title: "Maple House",
    category: "Accommodation",
    location: "Birmingham",
    price: 450,
    serviceType: "Accommodation",
    description:
      "Affordable shared housing suitable for people looking for a simple and comfortable place to stay.",
    icon: "🏡",
  },

  {
    id: 6,
    targetId: 2,
    title: "Kitchen Assistant",
    category: "Jobs",
    location: "Manchester",
    price: 0,
    serviceType: "Jobs",
    description:
      "A part-time beginner-friendly hospitality role with training available.",
    icon: "👨‍🍳",
  },
];


function Recommendations() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [additionalNeeds, setAdditionalNeeds] = useState("");

  const [recommendations, setRecommendations] = useState([]);
  const [searched, setSearched] = useState(false);


  const closeMenu = () => {
    setMenuOpen(false);
  };


  const handleRecommendations = () => {
    let results = recommendationData.filter((item) => {
      const locationMatches =
        !location ||
        item.location
          .toLowerCase()
          .includes(location.toLowerCase());

      const typeMatches =
        !serviceType ||
        item.serviceType === serviceType;

      let budgetMatches = true;

      if (
        serviceType === "Accommodation" &&
        budget
      ) {
        budgetMatches =
          item.price <= Number(budget);
      }

      return (
        locationMatches &&
        typeMatches &&
        budgetMatches
      );
    });


    /*
      Simple rule-based ranking.
      Exact location receives higher priority.
    */

    results = [...results].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      if (
        location &&
        a.location.toLowerCase() ===
          location.toLowerCase()
      ) {
        scoreA += 3;
      }

      if (
        location &&
        b.location.toLowerCase() ===
          location.toLowerCase()
      ) {
        scoreB += 3;
      }

      if (
        serviceType &&
        a.serviceType === serviceType
      ) {
        scoreA += 2;
      }

      if (
        serviceType &&
        b.serviceType === serviceType
      ) {
        scoreB += 2;
      }

      return scoreB - scoreA;
    });


    setRecommendations(results);
    setSearched(true);
  };


  const clearPreferences = () => {
    setLocation("");
    setBudget("");
    setServiceType("");
    setAdditionalNeeds("");

    setRecommendations([]);
    setSearched(false);
  };


  return (
    <div className="rec-page">

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <header className="rec-navbar">

        <Link
          to="/"
          className="rec-logo"
          onClick={closeMenu}
        >
          HelpIn
        </Link>


        {/* DESKTOP NAV */}

        <nav className="rec-nav-links">

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `rec-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            Home
          </NavLink>


          <NavLink
            to="/accommodation"
            className={({ isActive }) =>
              `rec-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            Accommodation
          </NavLink>


          <NavLink
            to="/food-support"
            className={({ isActive }) =>
              `rec-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            Food Support
          </NavLink>


          <NavLink
            to="/jobs"
            className={({ isActive }) =>
              `rec-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            Jobs
          </NavLink>


          <NavLink
            to="/recommendations"
            className={({ isActive }) =>
              `rec-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            Recommendations
          </NavLink>

        </nav>


        <NavLink
          to="/login"
          className="rec-login rec-desktop-login"
        >
          Login
        </NavLink>


        {/* MOBILE MENU BUTTON */}

        <button
          type="button"
          className="rec-menu-button"
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


        {/* MOBILE NAV */}

        {menuOpen && (
          <nav className="rec-mobile-nav">

            <NavLink
              to="/"
              end
              onClick={closeMenu}
              className={({ isActive }) =>
                `rec-mobile-link ${
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
                `rec-mobile-link ${
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
                `rec-mobile-link ${
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
                `rec-mobile-link ${
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
                `rec-mobile-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              Recommendations
            </NavLink>


            <NavLink
              to="/login"
              onClick={closeMenu}
              className="rec-mobile-login"
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

        <section className="rec-heading-section">

          <div className="rec-container">

            <div className="rec-title-row">

              <div className="rec-title-icon">
                💡
              </div>


              <div>

                <p className="rec-eyebrow">
                  RECOMMENDATIONS
                </p>

                <h1>
                  Find What Fits You
                </h1>

                <p className="rec-title-description">
                  Get personalised suggestions based
                  on your location, budget and needs.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* ==================================================
            PREFERENCES
        ================================================== */}

        <section className="rec-preferences-section">

          <div className="rec-preferences-card">

            <div className="rec-form-heading">

              <h2>
                Enter your preferences
              </h2>

              <p>
                Tell us what you need and HelpIn will
                find suitable options.
              </p>

            </div>


            <div className="rec-form-grid">

              {/* LOCATION */}

              <div className="rec-field">

                <label htmlFor="rec-location">
                  Location
                </label>

                <div className="rec-location-input">

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
                    id="rec-location"
                    type="text"
                    list="recommendation-locations"
                    value={location}
                    onChange={(event) =>
                      setLocation(event.target.value)
                    }
                    placeholder="Search location"
                  />

                  <datalist id="recommendation-locations">
                    <option value="London" />
                    <option value="Birmingham" />
                    <option value="Manchester" />
                    <option value="Leeds" />
                  </datalist>

                </div>

              </div>


              {/* BUDGET */}

              <div className="rec-field">

                <label htmlFor="rec-budget">
                  Maximum Budget
                </label>

                <div className="rec-budget-input">

                  <span>
                    £
                  </span>

                  <input
                    id="rec-budget"
                    type="number"
                    min="0"
                    value={budget}
                    onChange={(event) =>
                      setBudget(event.target.value)
                    }
                    placeholder="e.g. 600"
                  />

                </div>

              </div>


              {/* SERVICE TYPE */}

              <div className="rec-field">

                <label htmlFor="rec-service">
                  Service Type
                </label>

                <select
                  id="rec-service"
                  value={serviceType}
                  onChange={(event) =>
                    setServiceType(event.target.value)
                  }
                >
                  <option value="">
                    All Services
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


              {/* ADDITIONAL NEEDS */}

              <div className="rec-field rec-needs-field">

                <label htmlFor="rec-needs">
                  Additional Needs
                  <span> (optional)</span>
                </label>

                <input
                  id="rec-needs"
                  type="text"
                  value={additionalNeeds}
                  onChange={(event) =>
                    setAdditionalNeeds(
                      event.target.value
                    )
                  }
                  placeholder="e.g. beginner friendly, free support..."
                />

              </div>

            </div>


            <div className="rec-form-actions">

              {(location ||
                budget ||
                serviceType ||
                additionalNeeds) && (
                <button
                  type="button"
                  className="rec-clear-button"
                  onClick={clearPreferences}
                >
                  Clear
                </button>
              )}


              <button
                type="button"
                className="rec-submit-button"
                onClick={handleRecommendations}
              >
                <span>
                  ✨
                </span>

                Get Recommendations
              </button>

            </div>

          </div>

        </section>


        {/* ==================================================
            BEFORE SEARCH
        ================================================== */}

        {!searched && (
          <section className="rec-info-section">

            <div className="rec-info-card">

              <div className="rec-info-icon">
                💡
              </div>

              <h2>
                Find support that matches your needs
              </h2>

              <p>
                Enter your preferences above to see
                accommodation, food support and job
                opportunities that may be suitable
                for you.
              </p>

              <div className="rec-rule-note">
                Recommendations use simple matching
                based on your selected preferences.
              </div>

            </div>

          </section>
        )}


        {/* ==================================================
            RESULTS
        ================================================== */}

        {searched && (
          <section className="rec-results-section">

            <div className="rec-results-header">

              <div>

                <p className="rec-results-label">
                  RECOMMENDED FOR YOU
                </p>

                <h2>
                  Your recommendations
                </h2>

                <p className="rec-results-count">
                  {recommendations.length}{" "}
                  {recommendations.length === 1
                    ? "match"
                    : "matches"}{" "}
                  found
                </p>

              </div>

            </div>


            {recommendations.length === 0 ? (

              <div className="rec-no-results">

                <div className="rec-no-results-icon">
                  🔎
                </div>

                <h3>
                  No matching services found
                </h3>

                <p>
                  Try changing your location,
                  budget or service type.
                </p>

                <button
                  type="button"
                  onClick={clearPreferences}
                >
                  Change preferences
                </button>

              </div>

            ) : (

              <div className="rec-results-grid">

                {recommendations.map((item) => (

                  <article
                    key={item.id}
                    className="rec-result-card"
                  >

                    {/* CARD IMAGE */}

                    <div className="rec-card-image">

                      <div className="rec-card-icon">
                        {item.icon}
                      </div>

                    </div>


                    {/* CARD CONTENT */}

                    <div className="rec-card-content">

                      <div className="rec-card-top">

                        <span
                          className={`rec-category rec-category-${item.category
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {item.category}
                        </span>

                      </div>


                      <h3>
                        {item.title}
                      </h3>


                      {/* LOCATION */}

                      <div className="rec-card-location">

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

                        <span>
                          {item.location}
                        </span>

                      </div>


                      {/* ACCOMMODATION PRICE */}

                      {item.category ===
                        "Accommodation" && (
                        <p className="rec-price">
                          £{item.price}

                          <span>
                            {" "}
                            / month
                          </span>
                        </p>
                      )}


                      {/* FOOD SUPPORT */}

                      {item.category ===
                        "Food Support" && (
                        <p className="rec-free">
                          Free support
                        </p>
                      )}


                      {/* JOB */}

                      {item.category ===
                        "Jobs" && (
                        <p className="rec-job-label">
                          Beginner-friendly job
                        </p>
                      )}


                      <p className="rec-card-description">
                        {item.description}
                      </p>


                      {/* ==================================================
                          FIXED VIEW DETAILS LINK
                      ================================================== */}

                      <Link
                        to={
                          item.category === "Jobs"
                            ? `/jobs/${item.targetId}`
                            : `/services/${item.targetId}`
                        }
                        className="rec-view-button"
                      >
                        View Details

                        <span>
                          →
                        </span>
                      </Link>

                    </div>

                  </article>

                ))}

              </div>

            )}

          </section>
        )}

      </main>


      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="rec-footer">

        <div className="rec-footer-brand">

          <h2>
            HelpIn
          </h2>

          <p>
            Helping newcomers find essential
            support in one simple place.
          </p>

        </div>


        <div className="rec-footer-column">

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


        <div className="rec-footer-column">

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


      <div className="rec-copyright">
        © 2026 HelpIn. All rights reserved.
      </div>

    </div>
  );
}

export default Recommendations;