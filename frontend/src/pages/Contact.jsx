import {
  useState,
} from "react";

import {
  Link,
  NavLink,
} from "react-router-dom";

import {
  sendContactMessage,
} from "../services/api";

import "./Contact.css";


const initialForm = {
  reason: "General enquiry",
  name: "",
  email: "",
  message: "",
};


function Contact() {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const [form, setForm] =
    useState(initialForm);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  const closeMenu = () => {
    setMenuOpen(false);
  };


  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  };


  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      if (!form.message.trim()) {
        setError(
          "Please enter a message."
        );

        return;
      }

      try {
        setSending(true);

        await sendContactMessage({
          reason:
            form.reason,
          name:
            form.name.trim(),
          email:
            form.email.trim(),
          message:
            form.message.trim(),
        });

        setForm(initialForm);

        setSuccess(
          "Your message has been sent to HelpIn. Thank you for getting in touch."
        );

      } catch (err) {
        setError(
          err?.message ||
          "Unable to send your message right now."
        );

      } finally {
        setSending(false);
      }
    };


  return (
    <div className="contact-page">

      <header className="contact-navbar">

        <Link
          to="/"
          className="contact-logo"
          onClick={closeMenu}
        >
          HelpIn
        </Link>


        <nav className="contact-nav-links">

          <NavLink
            to="/"
            end
            className="contact-nav-link"
          >
            Home
          </NavLink>

          <NavLink
            to="/accommodation"
            className="contact-nav-link"
          >
            Accommodation
          </NavLink>

          <NavLink
            to="/food-support"
            className="contact-nav-link"
          >
            Food Support
          </NavLink>

          <NavLink
            to="/jobs"
            className="contact-nav-link"
          >
            Jobs
          </NavLink>

          <NavLink
            to="/recommendations"
            className="contact-nav-link"
          >
            Recommendations
          </NavLink>

          <NavLink
            to="/contact"
            className="contact-nav-link active"
          >
            Contact
          </NavLink>

        </nav>


        <NavLink
          to="/login"
          className="contact-login contact-desktop-login"
        >
          Login
        </NavLink>


        <button
          type="button"
          className="contact-menu-button"
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          onClick={() =>
            setMenuOpen(
              (open) => !open
            )
          }
        >
          {menuOpen ? "×" : "☰"}
        </button>


        {menuOpen && (
          <nav className="contact-mobile-nav">

            <NavLink
              to="/"
              onClick={closeMenu}
            >
              Home
            </NavLink>

            <NavLink
              to="/accommodation"
              onClick={closeMenu}
            >
              Accommodation
            </NavLink>

            <NavLink
              to="/food-support"
              onClick={closeMenu}
            >
              Food Support
            </NavLink>

            <NavLink
              to="/jobs"
              onClick={closeMenu}
            >
              Jobs
            </NavLink>

            <NavLink
              to="/recommendations"
              onClick={closeMenu}
            >
              Recommendations
            </NavLink>

            <NavLink
              to="/contact"
              onClick={closeMenu}
              className="active"
            >
              Contact
            </NavLink>

            <NavLink
              to="/login"
              onClick={closeMenu}
              className="contact-mobile-login"
            >
              Login
            </NavLink>

          </nav>
        )}

      </header>


      <main className="contact-main">

        <section className="contact-intro">

          <p className="contact-eyebrow">
            CONTACT HELPIN
          </p>

          <h1>
            How can we help?
          </h1>

          <p>
            Use this form to report incorrect
            information, suggest a service,
            report a broken link or send a
            general question to the HelpIn team.
          </p>

        </section>


        <section className="contact-layout">

          <div className="contact-form-card">

            <div className="contact-form-heading">

              <h2>
                Send us a message
              </h2>

              <p>
                Name and email are optional.
                Add your email only if you would
                like a reply.
              </p>

            </div>


            {success && (
              <div className="contact-success">
                {success}
              </div>
            )}


            {error && (
              <div className="contact-error">
                {error}
              </div>
            )}


            <form
              onSubmit={handleSubmit}
              className="contact-form"
            >

              <div className="contact-field full">

                <label htmlFor="contact-reason">
                  Reason for contact
                </label>

                <select
                  id="contact-reason"
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  disabled={sending}
                >
                  <option value="General enquiry">
                    General enquiry
                  </option>

                  <option value="Report incorrect information">
                    Report incorrect information
                  </option>

                  <option value="Suggest a service">
                    Suggest a service
                  </option>

                  <option value="Report a broken link">
                    Report a broken link
                  </option>

                  <option value="Technical problem">
                    Technical problem
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>

              </div>


              <div className="contact-field">

                <label htmlFor="contact-name">
                  Name
                  <span>Optional</span>
                </label>

                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  maxLength="100"
                  value={form.name}
                  onChange={handleChange}
                  disabled={sending}
                  placeholder="Your name"
                />

              </div>


              <div className="contact-field">

                <label htmlFor="contact-email">
                  Email
                  <span>Optional</span>
                </label>

                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  maxLength="254"
                  value={form.email}
                  onChange={handleChange}
                  disabled={sending}
                  placeholder="you@example.com"
                />

              </div>


              <div className="contact-field full">

                <label htmlFor="contact-message">
                  Message
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  rows="7"
                  maxLength="2000"
                  value={form.message}
                  onChange={handleChange}
                  disabled={sending}
                  placeholder="Tell us how we can help..."
                  required
                />

                <span className="contact-character-count">
                  {form.message.length}/2000
                </span>

              </div>


              <div className="contact-privacy-note">
                Please do not include passport
                details, immigration status,
                financial information or other
                sensitive personal information.
              </div>


              <button
                type="submit"
                className="contact-submit"
                disabled={sending}
              >
                {sending
                  ? "Sending..."
                  : "Send Message"}
              </button>

            </form>

          </div>


          <aside className="contact-help-card">

            <div className="contact-help-icon">
              ♡
            </div>

            <h2>
              Contacting a service?
            </h2>

            <p>
              If you want to contact a food bank,
              accommodation provider or employer,
              use the contact details shown on
              that listing.
            </p>

            <p>
              This form is for contacting the
              HelpIn website team about the
              platform itself.
            </p>

            <div className="contact-help-links">

              <Link to="/accommodation">
                Browse Accommodation
              </Link>

              <Link to="/food-support">
                Browse Food Support
              </Link>

              <Link to="/jobs">
                Browse Jobs
              </Link>

            </div>

          </aside>

        </section>

      </main>


      <footer className="contact-footer">

        <div>
          <strong>
            HelpIn
          </strong>

          <p>
            Helping newcomers find essential
            support in one simple place.
          </p>
        </div>

        <div>
          <Link to="/">
            Home
          </Link>

          <Link to="/contact">
            Contact HelpIn
          </Link>

          <Link to="/recommendations">
            Recommendations
          </Link>
        </div>

      </footer>


      <div className="contact-copyright">
        © 2026 HelpIn. All rights reserved.
      </div>

    </div>
  );
}


export default Contact;
