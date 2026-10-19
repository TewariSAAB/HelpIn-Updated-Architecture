import {
  Link,
  NavLink,
} from "react-router-dom";

import "./About.css";


function About() {
  return (
    <div className="about-page">

      <header className="about-navbar">

        <Link
          to="/"
          className="about-logo"
        >
          HelpIn
        </Link>


        <nav className="about-nav-links">

          <NavLink
            to="/"
            end
            className="about-nav-link"
          >
            Home
          </NavLink>

          <NavLink
            to="/accommodation"
            className="about-nav-link"
          >
            Accommodation
          </NavLink>

          <NavLink
            to="/food-support"
            className="about-nav-link"
          >
            Food Support
          </NavLink>

          <NavLink
            to="/jobs"
            className="about-nav-link"
          >
            Jobs
          </NavLink>

          <NavLink
            to="/recommendations"
            className="about-nav-link"
          >
            Recommendations
          </NavLink>

        </nav>


        <NavLink
          to="/login"
          className="about-login"
        >
          Login
        </NavLink>

      </header>


      <main>

        <section className="about-hero">

          <div className="about-container">

            <p className="about-eyebrow">
              ABOUT HELPIN
            </p>

            <h1>
              Making essential support
              easier to find
            </h1>

            <p className="about-hero-text">
              HelpIn is a support platform designed
              to help immigrants, refugees and other
              newcomers find useful local information
              in one simple place.
            </p>

            <div className="about-hero-actions">

              <Link
                to="/recommendations"
                className="about-primary-button"
              >
                Find What Fits You
              </Link>

              <Link
                to="/"
                className="about-secondary-button"
              >
                Explore HelpIn
              </Link>

            </div>

          </div>

        </section>


        <section className="about-section">

          <div className="about-container">

            <div className="about-section-heading">

              <p>
                OUR PURPOSE
              </p>

              <h2>
                One place for practical support
              </h2>

              <span>
                Newcomers can face fragmented
                information when looking for
                accommodation, food support and
                beginner-friendly employment.
                HelpIn brings these areas together
                so useful options are easier to
                discover and compare.
              </span>

            </div>


            <div className="about-purpose-grid">

              <article>
                <div className="about-card-icon">
                  🏠
                </div>

                <h3>
                  Accommodation
                </h3>

                <p>
                  Browse accommodation support
                  and housing-related options
                  by location, price and service
                  type.
                </p>
              </article>


              <article>
                <div className="about-card-icon green">
                  🍲
                </div>

                <h3>
                  Food Support
                </h3>

                <p>
                  Find food banks, community
                  services and other local food
                  support information.
                </p>
              </article>


              <article>
                <div className="about-card-icon purple">
                  💼
                </div>

                <h3>
                  Jobs
                </h3>

                <p>
                  Explore beginner-friendly job
                  opportunities and continue to
                  the original provider website
                  to apply.
                </p>
              </article>

            </div>

          </div>

        </section>


        <section className="about-how-section">

          <div className="about-container about-how-grid">

            <div>

              <p className="about-small-label">
                HOW HELPIN WORKS
              </p>

              <h2>
                Simple searches and
                rule-based recommendations
              </h2>

              <p>
                HelpIn uses filters and
                rule-based matching to show
                options based on information
                such as location, budget,
                category and service type.
                The recommendation feature
                does not use artificial
                intelligence or machine
                learning.
              </p>

              <p>
                Visitors can browse the
                platform without creating a
                public account, making the
                main services available with
                fewer barriers.
              </p>

            </div>


            <div className="about-steps">

              <div className="about-step">
                <span>1</span>

                <div>
                  <h3>
                    Choose what you need
                  </h3>

                  <p>
                    Search accommodation,
                    food support or jobs.
                  </p>
                </div>
              </div>


              <div className="about-step">
                <span>2</span>

                <div>
                  <h3>
                    Apply your preferences
                  </h3>

                  <p>
                    Use location, budget and
                    other available filters.
                  </p>
                </div>
              </div>


              <div className="about-step">
                <span>3</span>

                <div>
                  <h3>
                    View the most relevant options
                  </h3>

                  <p>
                    Open details and continue
                    to the original provider
                    when appropriate.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </section>


        <section className="about-values-section">

          <div className="about-container">

            <div className="about-section-heading">

              <p>
                OUR APPROACH
              </p>

              <h2>
                Clear, accessible and privacy-conscious
              </h2>

            </div>


            <div className="about-values-grid">

              <article>
                <strong>
                  Simple information
                </strong>

                <p>
                  HelpIn uses clear navigation
                  and straightforward language
                  to make important information
                  easier to understand.
                </p>
              </article>


              <article>
                <strong>
                  Minimal personal data
                </strong>

                <p>
                  The platform is designed to
                  avoid collecting unnecessary
                  sensitive information from
                  visitors.
                </p>
              </article>


              <article>
                <strong>
                  Useful external sources
                </strong>

                <p>
                  Service and job details can
                  direct visitors to original
                  providers for further
                  information or applications.
                </p>
              </article>

            </div>

          </div>

        </section>


        <section className="about-notice-section">

          <div className="about-container">

            <div className="about-notice">

              <div>

                <p className="about-small-label">
                  IMPORTANT
                </p>

                <h2>
                  Information and support,
                  not professional advice
                </h2>

              </div>

              <p>
                HelpIn is designed to help people
                discover useful services and
                opportunities. It does not provide
                legal, immigration or financial
                advice. Visitors should contact
                the relevant organisation or
                provider for official information.
              </p>

            </div>

          </div>

        </section>

      </main>


      <footer className="about-footer">

        <div className="about-footer-brand">

          <h2>
            HelpIn
          </h2>

          <p>
            Helping newcomers find essential
            support in one simple place.
          </p>

        </div>


        <div className="about-footer-column">

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


        <div className="about-footer-column">

          <h4>
            About
          </h4>

          <Link to="/about">
            About HelpIn
          </Link>

          <Link to="/recommendations">
            Recommendations
          </Link>

        </div>


        <div className="about-footer-column">

          <h4>
            Get In Touch
          </h4>

          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=dhruvtewari99%40gmail.com&su=HelpIn%20Enquiry"
            target="_blank"
            rel="noreferrer"
          >
            Contact HelpIn
          </a>

        </div>

      </footer>


      <div className="about-copyright">
        © 2026 HelpIn. All rights reserved.
      </div>

    </div>
  );
}


export default About;
