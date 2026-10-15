import { useState } from "react";
import {
  Link,
  NavLink,
  useParams,
} from "react-router-dom";

import "./ServiceDetails.css";


const services = [
  {
    id: "1",
    name: "Riverside Apartments",
    category: "Accommodation",
    location: "London",
    price: "£600 / month",
    serviceType: "Shared Room",
    description:
      "Affordable shared rooms with good transport links and essential amenities. Suitable for individuals and families.",
    openingHours: "Mon - Fri: 9:00 - 17:00",
    phone: "020 7123 4567",
    address:
      "123 Riverside Road, London, E1 6AN",
    website: "https://www.example.org",
    websiteLabel: "www.example.org",
    icon: "🏢",
    theme: "blue",
  },

  {
    id: "2",
    name: "Maple House",
    category: "Accommodation",
    location: "Birmingham",
    price: "£450 / month",
    serviceType: "Shared Room",
    description:
      "Affordable shared accommodation offering comfortable rooms with access to transport, shops and local community services.",
    openingHours: "Mon - Fri: 9:00 - 17:00",
    phone: "0121 555 0188",
    address:
      "45 Maple Street, Birmingham, B1 2AA",
    website: "https://www.example.org",
    websiteLabel: "www.example.org",
    icon: "🏡",
    theme: "blue",
  },

  {
    id: "3",
    name: "City Residences",
    category: "Accommodation",
    location: "Manchester",
    price: "£700 / month",
    serviceType: "Studio",
    description:
      "Private studio accommodation close to transport links and essential services in Manchester.",
    openingHours: "Mon - Sat: 9:00 - 18:00",
    phone: "0161 555 0244",
    address:
      "88 City Road, Manchester, M1 4AB",
    website: "https://www.example.org",
    websiteLabel: "www.example.org",
    icon: "🏙️",
    theme: "blue",
  },

  {
    id: "4",
    name: "Hope Community Food Bank",
    category: "Food Support",
    location: "London",
    price: "Free",
    serviceType: "Food Bank",
    description:
      "Provides free food parcels and essential groceries for individuals and families in need. Support is available to newcomers and local residents.",
    openingHours: "Mon - Fri: 10:00 - 16:00",
    phone: "020 1234 5678",
    address:
      "123 Community Street, London, E1 6AN",
    website: "https://www.example.org",
    websiteLabel: "www.example.org",
    icon: "🥫",
    theme: "green",
  },

  {
    id: "5",
    name: "St. Mary's Community Kitchen",
    category: "Food Support",
    location: "Birmingham",
    price: "Free",
    serviceType: "Community Kitchen",
    description:
      "A welcoming community kitchen providing prepared meals and local support for individuals and families.",
    openingHours: "Mon - Sat: 11:00 - 18:00",
    phone: "0121 555 0102",
    address:
      "21 St Mary's Road, Birmingham, B2 3CD",
    website: "https://www.example.org",
    websiteLabel: "www.example.org",
    icon: "🍲",
    theme: "green",
  },

  {
    id: "6",
    name: "Good Food Hub",
    category: "Food Support",
    location: "Leeds",
    price: "Low Cost",
    serviceType: "Discounted Food",
    description:
      "Affordable groceries and discounted food options helping people reduce everyday food costs.",
    openingHours: "Mon - Sat: 9:00 - 18:00",
    phone: "0113 555 0192",
    address:
      "60 Market Road, Leeds, LS1 4EF",
    website: "https://www.example.org",
    websiteLabel: "www.example.org",
    icon: "🥗",
    theme: "green",
  },
];


function ServiceDetails() {
  const { id } = useParams();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const service = services.find(
    (item) => item.id === id
  );


  const closeMenu = () => {
    setMenuOpen(false);
  };


  if (!service) {
    return (
      <div className="details-not-found">

        <div>
          <span>🔎</span>

          <h1>
            Service not found
          </h1>

          <p>
            This service could not be found.
          </p>

          <Link to="/">
            Return Home
          </Link>
        </div>

      </div>
    );
  }


  const backRoute =
    service.category === "Accommodation"
      ? "/accommodation"
      : "/food-support";


  const relatedServices = services
    .filter(
      (item) =>
        item.category === service.category &&
        item.id !== service.id
    )
    .slice(0, 3);


  const directionsUrl =
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      service.address
    )}`;


  return (
    <div className="details-page">

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <header className="details-navbar">

        <Link
          to="/"
          className="details-logo"
          onClick={closeMenu}
        >
          HelpIn
        </Link>


        {/* DESKTOP NAV */}

        <nav className="details-nav-links">

          <NavLink
            to="/"
            end
            className="details-nav-link"
          >
            Home
          </NavLink>


          <NavLink
            to="/accommodation"
            className={
              service.category ===
              "Accommodation"
                ? "details-nav-link active"
                : "details-nav-link"
            }
          >
            Accommodation
          </NavLink>


          <NavLink
            to="/food-support"
            className={
              service.category ===
              "Food Support"
                ? "details-nav-link active"
                : "details-nav-link"
            }
          >
            Food Support
          </NavLink>


          <NavLink
            to="/jobs"
            className="details-nav-link"
          >
            Jobs
          </NavLink>


          <NavLink
            to="/recommendations"
            className="details-nav-link"
          >
            Recommendations
          </NavLink>

        </nav>


        <NavLink
          to="/login"
          className="details-login details-desktop-login"
        >
          Login
        </NavLink>


        {/* MOBILE MENU BUTTON */}

        <button
          type="button"
          className="details-menu-button"
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


        {/* MOBILE NAV */}

        {menuOpen && (
          <nav className="details-mobile-nav">

            <NavLink
              to="/"
              end
              onClick={closeMenu}
              className="details-mobile-link"
            >
              Home
            </NavLink>


            <NavLink
              to="/accommodation"
              onClick={closeMenu}
              className={
                service.category ===
                "Accommodation"
                  ? "details-mobile-link active"
                  : "details-mobile-link"
              }
            >
              Accommodation
            </NavLink>


            <NavLink
              to="/food-support"
              onClick={closeMenu}
              className={
                service.category ===
                "Food Support"
                  ? "details-mobile-link active"
                  : "details-mobile-link"
              }
            >
              Food Support
            </NavLink>


            <NavLink
              to="/jobs"
              onClick={closeMenu}
              className="details-mobile-link"
            >
              Jobs
            </NavLink>


            <NavLink
              to="/recommendations"
              onClick={closeMenu}
              className="details-mobile-link"
            >
              Recommendations
            </NavLink>


            <NavLink
              to="/login"
              onClick={closeMenu}
              className="details-mobile-login"
            >
              Login
            </NavLink>

          </nav>
        )}

      </header>


      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="details-main">

        {/* BACK */}

        <Link
          to={backRoute}
          className="details-back"
        >
          <span>←</span>
          Back to search
        </Link>


        {/* ==================================================
            SERVICE
        ================================================== */}

        <section className="details-service-layout">

          {/* IMAGE */}

          <div
            className={`details-service-image details-image-${service.theme}`}
          >

            <div className="details-main-icon">
              {service.icon}
            </div>

          </div>


          {/* INFORMATION */}

          <div className="details-service-content">

            <div className="details-tags">

              <span
                className={
                  service.category ===
                  "Accommodation"
                    ? "details-category details-category-blue"
                    : "details-category details-category-green"
                }
              >
                {service.category}
              </span>


              <span className="details-location-tag">
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

                {service.location}
              </span>

            </div>


            <h1>
              {service.name}
            </h1>


            <div className="details-service-type-row">

              <span>
                {service.serviceType}
              </span>

              <strong>
                {service.price}
              </strong>

            </div>


            <p className="details-description">
              {service.description}
            </p>


            {/* INFORMATION BOX */}

            <div className="details-info-box">

              {/* OPENING HOURS */}

              <div className="details-info-row">

                <div className="details-info-icon">
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
                      d="M12 8V12L15 14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div>
                  <span>
                    Opening Hours
                  </span>

                  <strong>
                    {service.openingHours}
                  </strong>
                </div>

              </div>


              {/* PHONE */}

              <div className="details-info-row">

                <div className="details-info-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M7 4H10L11.5 8L9.5 9.5C10.5 11.8 12.2 13.5 14.5 14.5L16 12.5L20 14V17C20 18.1 19.1 19 18 19C10.8 19 5 13.2 5 6C5 4.9 5.9 4 7 4Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div>
                  <span>
                    Contact Number
                  </span>

                  <a
                    href={`tel:${service.phone}`}
                  >
                    {service.phone}
                  </a>
                </div>

              </div>


              {/* ADDRESS */}

              <div className="details-info-row">

                <div className="details-info-icon">
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
                </div>

                <div>
                  <span>
                    Address
                  </span>

                  <strong>
                    {service.address}
                  </strong>
                </div>

              </div>


              {/* WEBSITE */}

              <div className="details-info-row">

                <div className="details-info-icon">
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
                      d="M4 12H20"
                      stroke="currentColor"
                      strokeWidth="2"
                    />

                    <path
                      d="M12 4C14 6.2 15 8.9 15 12C15 15.1 14 17.8 12 20"
                      stroke="currentColor"
                      strokeWidth="2"
                    />

                    <path
                      d="M12 4C10 6.2 9 8.9 9 12C9 15.1 10 17.8 12 20"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                <div>
                  <span>
                    Website
                  </span>

                  <a
                    href={service.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {service.websiteLabel}
                  </a>
                </div>

              </div>

            </div>


            {/* BUTTONS */}

            <div className="details-actions">

              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="details-directions-button"
              >
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

                Get Directions
              </a>


              <a
                href={service.website}
                target="_blank"
                rel="noreferrer"
                className="details-website-button"
              >
                Visit Website

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
            RELATED SERVICES
        ================================================== */}

        <section className="details-related-section">

          <div className="details-related-header">

            <div>

              <p>
                YOU MAY ALSO LIKE
              </p>

              <h2>
                Related Services
              </h2>

            </div>


            <Link to={backRoute}>
              View all →
            </Link>

          </div>


          <div className="details-related-grid">

            {relatedServices.map((item) => (

              <Link
                key={item.id}
                to={`/services/${item.id}`}
                className="details-related-card"
              >

                <div
                  className={`details-related-image details-related-${item.theme}`}
                >
                  <span>
                    {item.icon}
                  </span>
                </div>


                <div className="details-related-content">

                  <span
                    className={
                      item.category ===
                      "Accommodation"
                        ? "details-related-tag blue"
                        : "details-related-tag green"
                    }
                  >
                    {item.category}
                  </span>

                  <h3>
                    {item.name}
                  </h3>

                  <p>
                    {item.location}
                  </p>

                </div>

              </Link>

            ))}

          </div>

        </section>

      </main>


      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="details-footer">

        <div className="details-footer-brand">

          <h2>
            HelpIn
          </h2>

          <p>
            Helping newcomers find essential
            support in one simple place.
          </p>

        </div>


        <div className="details-footer-column">

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


        <div className="details-footer-column">

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


      <div className="details-copyright">
        © 2026 HelpIn. All rights reserved.
      </div>

    </div>
  );
}

export default ServiceDetails;