import { Link } from "react-router-dom";
import "./HelpInLogo.css";

function HelpInLogo({ onClick }) {
  return (
    <Link
      to="/"
      className="helpin-logo"
      onClick={onClick}
      aria-label="HelpIn Home"
    >
      <svg
        className="helpin-logo-icon"
        viewBox="0 0 52 52"
        fill="none"
        aria-hidden="true"
      >
        {/* LEFT PERSON */}
        <circle
          cx="18"
          cy="10"
          r="6"
          fill="#18B7AE"
        />

        <path
          d="
            M17 17
            C9 18 5 24 6 31
            C7 38 14 43 26 49
          "
          stroke="#18B7AE"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        <path
          d="
            M17 23
            C13 23 11 25 10 28
            C14 27 18 27 22 30
          "
          stroke="#18B7AE"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />


        {/* RIGHT PERSON */}
        <circle
          cx="34"
          cy="10"
          r="6"
          fill="#1769F6"
        />

        <path
          d="
            M35 17
            C43 18 47 24 46 31
            C45 38 38 43 26 49
          "
          stroke="#1769F6"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        <path
          d="
            M35 23
            C39 23 41 25 42 28
            C38 27 34 27 30 30
          "
          stroke="#1769F6"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      <span className="helpin-logo-text">
        HelpIn
      </span>
    </Link>
  );
}

export default HelpInLogo;