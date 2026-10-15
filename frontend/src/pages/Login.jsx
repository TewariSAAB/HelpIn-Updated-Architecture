import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import "./Login.css";

import {
  loginUser,
  requestPasswordReset,
  confirmPasswordReset,
} from "../services/authService";


/* ======================================================
   HELPIN LOGO
====================================================== */

function HelpInLogo({
  className = "",
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 60 60"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="20"
        cy="12"
        r="6.5"
        fill="#13B5AE"
      />

      <path
        d="M18 20C9 21 6 29 8 36C10 43 18 48 30 54"
        stroke="#13B5AE"
        strokeWidth="6"
        strokeLinecap="round"
      />

      <path
        d="M18 26C14 25 11 27 10 31C15 29 19 30 23 34"
        stroke="#13B5AE"
        strokeWidth="5"
        strokeLinecap="round"
      />

      <circle
        cx="40"
        cy="12"
        r="6.5"
        fill="#1769F6"
      />

      <path
        d="M42 20C51 21 54 29 52 36C50 43 42 48 30 54"
        stroke="#1769F6"
        strokeWidth="6"
        strokeLinecap="round"
      />

      <path
        d="M42 26C46 25 49 27 50 31C45 29 41 30 37 34"
        stroke="#1769F6"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}


/* ======================================================
   LOGIN PAGE
====================================================== */

function Login() {
  const navigate = useNavigate();

  const [
    mode,
    setMode,
  ] = useState("login");

  const [
    username,
    setUsername,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    verificationCode,
    setVerificationCode,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    codeDestination,
    setCodeDestination,
  ] = useState("");


  /* ======================================================
     CLEAR MESSAGES
  ====================================================== */

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };


  /* ======================================================
     LOGIN
  ====================================================== */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      clearMessages();

      if (
        !username.trim() ||
        !password
      ) {
        setError(
          "Please enter your username and password."
        );

        return;
      }

      try {
        setLoading(true);

        const result =
          await loginUser(
            username.trim(),
            password
          );

        if (
          result?.challenge ===
          "NEW_PASSWORD_REQUIRED"
        ) {
          setError(
            "This account requires a new password before login can continue."
          );

          return;
        }

        navigate(
          "/admin",
          {
            replace: true,
          }
        );
      } catch (err) {
        console.error(
          "COGNITO LOGIN ERROR:",
          err
        );

        if (
          err?.code ===
          "NotAuthorizedException"
        ) {
          setError(
            "Incorrect username or password."
          );
        } else if (
          err?.code ===
          "UserNotFoundException"
        ) {
          setError(
            "Incorrect username or password."
          );
        } else if (
          err?.code ===
          "UserNotConfirmedException"
        ) {
          setError(
            "This account has not been confirmed."
          );
        } else if (
          err?.code ===
          "PasswordResetRequiredException"
        ) {
          setError(
            "A password reset is required for this account."
          );
        } else {
          setError(
            err?.message ||
            "Unable to login. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };


  /* ======================================================
     OPEN FORGOT PASSWORD
  ====================================================== */

  const openForgotPassword = () => {
    clearMessages();

    setVerificationCode("");
    setNewPassword("");
    setConfirmPassword("");
    setCodeDestination("");

    setMode("forgot");
  };


  /* ======================================================
     SEND RESET CODE
  ====================================================== */

  const handleSendResetCode =
    async (event) => {
      event.preventDefault();

      clearMessages();

      if (!username.trim()) {
        setError(
          "Please enter your username."
        );

        return;
      }

      try {
        setLoading(true);

        const result =
          await requestPasswordReset(
            username.trim()
          );

        const destination =
          result
            ?.CodeDeliveryDetails
            ?.Destination ||
          result
            ?.codeDeliveryDetails
            ?.Destination ||
          "";

        setCodeDestination(
          destination
        );

        setMode("confirm-reset");

        setSuccess(
          destination
            ? `A verification code was sent to ${destination}.`
            : "A verification code has been sent to your verified recovery email."
        );
      } catch (err) {
        console.error(
          "COGNITO PASSWORD RESET ERROR:",
          err
        );

        if (
          err?.code ===
          "UserNotFoundException"
        ) {
          setError(
            "Unable to start password recovery for this account."
          );
        } else if (
          err?.code ===
          "InvalidParameterException"
        ) {
          setError(
            "This account does not have a verified recovery email."
          );
        } else if (
          err?.code ===
          "LimitExceededException"
        ) {
          setError(
            "Too many reset attempts. Please wait and try again."
          );
        } else if (
          err?.code ===
          "TooManyRequestsException"
        ) {
          setError(
            "Too many requests. Please wait before trying again."
          );
        } else {
          setError(
            err?.message ||
            "Unable to send the password reset code."
          );
        }
      } finally {
        setLoading(false);
      }
    };


  /* ======================================================
     PASSWORD POLICY
  ====================================================== */

  const validateNewPassword = () => {
    if (newPassword.length < 8) {
      return (
        "Password must contain at least 8 characters."
      );
    }

    if (
      !/[A-Z]/.test(
        newPassword
      )
    ) {
      return (
        "Password must contain at least one uppercase letter."
      );
    }

    if (
      !/[a-z]/.test(
        newPassword
      )
    ) {
      return (
        "Password must contain at least one lowercase letter."
      );
    }

    if (
      !/[0-9]/.test(
        newPassword
      )
    ) {
      return (
        "Password must contain at least one number."
      );
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      return (
        "The new passwords do not match."
      );
    }

    return "";
  };


  /* ======================================================
     CONFIRM RESET
  ====================================================== */

  const handleConfirmReset =
    async (event) => {
      event.preventDefault();

      clearMessages();

      if (
        !verificationCode.trim()
      ) {
        setError(
          "Please enter the verification code."
        );

        return;
      }

      if (
        !newPassword ||
        !confirmPassword
      ) {
        setError(
          "Please enter and confirm your new password."
        );

        return;
      }

      const passwordError =
        validateNewPassword();

      if (passwordError) {
        setError(passwordError);

        return;
      }

      try {
        setLoading(true);

        await confirmPasswordReset(
          username.trim(),
          verificationCode.trim(),
          newPassword
        );

        setPassword("");
        setVerificationCode("");
        setNewPassword("");
        setConfirmPassword("");
        setCodeDestination("");

        setMode("login");

        setSuccess(
          "Password reset successful. You can now sign in with your new password."
        );
      } catch (err) {
        console.error(
          "COGNITO CONFIRM RESET ERROR:",
          err
        );

        if (
          err?.code ===
          "CodeMismatchException"
        ) {
          setError(
            "The verification code is incorrect."
          );
        } else if (
          err?.code ===
          "ExpiredCodeException"
        ) {
          setError(
            "The verification code has expired. Request a new code."
          );
        } else if (
          err?.code ===
          "InvalidPasswordException"
        ) {
          setError(
            "The new password does not meet the required password policy."
          );
        } else if (
          err?.code ===
          "LimitExceededException"
        ) {
          setError(
            "Too many attempts. Please wait and try again."
          );
        } else {
          setError(
            err?.message ||
            "Unable to reset the password."
          );
        }
      } finally {
        setLoading(false);
      }
    };


  /* ======================================================
     RESEND CODE
  ====================================================== */

  const handleResendCode =
    async () => {
      clearMessages();

      if (!username.trim()) {
        setMode("forgot");

        setError(
          "Please enter your username."
        );

        return;
      }

      try {
        setLoading(true);

        const result =
          await requestPasswordReset(
            username.trim()
          );

        const destination =
          result
            ?.CodeDeliveryDetails
            ?.Destination ||
          result
            ?.codeDeliveryDetails
            ?.Destination ||
          codeDestination;

        setCodeDestination(
          destination || ""
        );

        setSuccess(
          destination
            ? `A new verification code was sent to ${destination}.`
            : "A new verification code has been sent."
        );
      } catch (err) {
        console.error(
          "COGNITO RESEND CODE ERROR:",
          err
        );

        if (
          err?.code ===
          "LimitExceededException" ||
          err?.code ===
          "TooManyRequestsException"
        ) {
          setError(
            "Too many requests. Please wait before requesting another code."
          );
        } else {
          setError(
            err?.message ||
            "Unable to resend the verification code."
          );
        }
      } finally {
        setLoading(false);
      }
    };


  /* ======================================================
     RETURN TO LOGIN
  ====================================================== */

  const returnToLogin = () => {
    clearMessages();

    setMode("login");
    setVerificationCode("");
    setNewPassword("");
    setConfirmPassword("");
    setCodeDestination("");
  };


  /* ======================================================
     PAGE CONTENT
  ====================================================== */

  return (
    <div className="split-login-page">

      {/* ==================================================
          LEFT SIDE
      ================================================== */}

      <section className="split-login-left">

        <Link
          to="/"
          className="split-login-brand"
        >
          <HelpInLogo
            className="split-login-logo"
          />

          <div>
            <strong>
              HelpIn
            </strong>

            <span>
              SUPPORT • OPPORTUNITY • COMMUNITY
            </span>
          </div>
        </Link>


        <div
          className="quote-decoration quote-circle-one"
        />

        <div
          className="quote-decoration quote-circle-two"
        />


        <div className="split-login-quote">

          <span className="quote-mark">
            “
          </span>

          <h1>
            Every new beginning deserves
            support, hope, and a place to
            belong.
          </h1>

          <div className="quote-line" />

          <p>
            Welcome to HelpIn
          </p>

        </div>


        <div className="split-login-left-footer">

          <span>
            ♡
          </span>

          <p>
            Supporting people.
            Strengthening communities.
          </p>

        </div>

      </section>


      {/* ==================================================
          RIGHT SIDE
      ================================================== */}

      <section className="split-login-right">

        <Link
          to="/"
          className="split-login-back"
        >
          ← Back to Home
        </Link>


        <div className="split-login-card">

          <div className="login-card-brand">

            <HelpInLogo />

            <strong>
              HelpIn
            </strong>

          </div>


          {/* ==================================================
              LOGIN HEADING
          ================================================== */}

          {mode === "login" && (
            <div className="split-login-heading">

              <span>
                ADMIN ACCESS
              </span>

              <h2>
                Admin Login
              </h2>

              <p>
                Sign in to manage HelpIn
                services, jobs and platform content.
              </p>

            </div>
          )}


          {/* ==================================================
              FORGOT HEADING
          ================================================== */}

          {mode === "forgot" && (
            <div className="split-login-heading">

              <span>
                ACCOUNT RECOVERY
              </span>

              <h2>
                Forgot Password
              </h2>

              <p>
                Enter your username and Cognito
                will send a verification code to
                your verified recovery email.
              </p>

            </div>
          )}


          {/* ==================================================
              CONFIRM RESET HEADING
          ================================================== */}

          {mode === "confirm-reset" && (
            <div className="split-login-heading">

              <span>
                VERIFY ACCOUNT
              </span>

              <h2>
                Reset Password
              </h2>

              <p>
                Enter the verification code and
                choose a new secure password.
              </p>

            </div>
          )}


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div
              className="split-login-error"
              role="alert"
            >
              <strong>
                !
              </strong>

              <span>
                {error}
              </span>
            </div>
          )}


          {/* ==================================================
              SUCCESS
          ================================================== */}

          {success && (
            <div
              className="split-login-success"
              role="status"
            >
              <strong>
                ✓
              </strong>

              <span>
                {success}
              </span>
            </div>
          )}


          {/* ==================================================
              LOGIN FORM
          ================================================== */}

          {mode === "login" && (
            <>
              <form
                className="split-login-form"
                onSubmit={handleSubmit}
              >

                <div className="split-login-field">

                  <label htmlFor="username">
                    Username
                  </label>

                  <div className="split-login-input">

                    <span>
                      ♙
                    </span>

                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={username}
                      onChange={(event) =>
                        setUsername(
                          event.target.value
                        )
                      }
                      placeholder="Enter your username"
                      autoComplete="username"
                      disabled={loading}
                      required
                    />

                  </div>

                </div>


                <div className="split-login-field">

                  <div className="split-login-label-row">

                    <label htmlFor="password">
                      Password
                    </label>

                    <button
                      type="button"
                      className="split-forgot"
                      onClick={
                        openForgotPassword
                      }
                      disabled={loading}
                    >
                      Forgot password?
                    </button>

                  </div>


                  <div className="split-login-input">

                    <span>
                      ◉
                    </span>

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={loading}
                      required
                    />


                    <button
                      type="button"
                      className="split-show-password"
                      onClick={() =>
                        setShowPassword(
                          (current) =>
                            !current
                        )
                      }
                      disabled={loading}
                    >
                      {showPassword
                        ? "Hide"
                        : "Show"}
                    </button>

                  </div>

                </div>


                <button
                  type="submit"
                  className="split-login-button"
                  disabled={loading}
                >
                  {loading
                    ? "Signing in..."
                    : (
                      <>
                        Login
                        <span>
                          →
                        </span>
                      </>
                    )}
                </button>

              </form>


              <div className="split-login-divider">

                <span />

                <p>
                  OR
                </p>

                <span />

              </div>


              <Link
                to="/"
                className="split-login-guest"
              >
                Continue as Guest

                <span>
                  →
                </span>
              </Link>


              <p className="split-login-security">
                Secure HelpIn administrator access
                powered by Amazon Cognito
              </p>
            </>
          )}


          {/* ==================================================
              REQUEST RESET CODE FORM
          ================================================== */}

          {mode === "forgot" && (
            <>
              <form
                className="split-login-form"
                onSubmit={
                  handleSendResetCode
                }
              >

                <div className="split-login-field">

                  <label htmlFor="reset-username">
                    Username
                  </label>

                  <div className="split-login-input">

                    <span>
                      ♙
                    </span>

                    <input
                      id="reset-username"
                      name="reset-username"
                      type="text"
                      value={username}
                      onChange={(event) =>
                        setUsername(
                          event.target.value
                        )
                      }
                      placeholder="Enter your username"
                      autoComplete="username"
                      disabled={loading}
                      required
                    />

                  </div>

                </div>


                <div className="reset-information">

                  <strong>
                    Email privacy
                  </strong>

                  <p>
                    Your recovery email is stored
                    and handled by Amazon Cognito.
                    HelpIn does not store it in
                    the application database.
                  </p>

                </div>


                <button
                  type="submit"
                  className="split-login-button"
                  disabled={loading}
                >
                  {loading
                    ? "Sending code..."
                    : (
                      <>
                        Send Verification Code
                        <span>
                          →
                        </span>
                      </>
                    )}
                </button>

              </form>


              <button
                type="button"
                className="split-login-secondary"
                onClick={returnToLogin}
                disabled={loading}
              >
                ← Back to Login
              </button>
            </>
          )}


          {/* ==================================================
              CONFIRM PASSWORD RESET FORM
          ================================================== */}

          {mode === "confirm-reset" && (
            <>
              <form
                className="split-login-form"
                onSubmit={
                  handleConfirmReset
                }
              >

                <div className="split-login-field">

                  <label htmlFor="verification-code">
                    Verification Code
                  </label>

                  <div className="split-login-input">

                    <span>
                      #
                    </span>

                    <input
                      id="verification-code"
                      name="verification-code"
                      type="text"
                      inputMode="numeric"
                      value={
                        verificationCode
                      }
                      onChange={(event) =>
                        setVerificationCode(
                          event.target.value
                        )
                      }
                      placeholder="Enter verification code"
                      autoComplete="one-time-code"
                      disabled={loading}
                      required
                    />

                  </div>

                </div>


                <div className="split-login-field">

                  <label htmlFor="new-password">
                    New Password
                  </label>

                  <div className="split-login-input">

                    <span>
                      ◉
                    </span>

                    <input
                      id="new-password"
                      name="new-password"
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      value={newPassword}
                      onChange={(event) =>
                        setNewPassword(
                          event.target.value
                        )
                      }
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      disabled={loading}
                      required
                    />

                    <button
                      type="button"
                      className="split-show-password"
                      onClick={() =>
                        setShowNewPassword(
                          (current) =>
                            !current
                        )
                      }
                      disabled={loading}
                    >
                      {showNewPassword
                        ? "Hide"
                        : "Show"}
                    </button>

                  </div>

                </div>


                <div className="split-login-field">

                  <label htmlFor="confirm-new-password">
                    Confirm New Password
                  </label>

                  <div className="split-login-input">

                    <span>
                      ◉
                    </span>

                    <input
                      id="confirm-new-password"
                      name="confirm-new-password"
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        confirmPassword
                      }
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      disabled={loading}
                      required
                    />

                  </div>

                </div>


                <div className="password-requirements">

                  <strong>
                    Password requirements
                  </strong>

                  <p>
                    At least 8 characters,
                    including uppercase,
                    lowercase and a number.
                  </p>

                </div>


                <button
                  type="submit"
                  className="split-login-button"
                  disabled={loading}
                >
                  {loading
                    ? "Resetting password..."
                    : (
                      <>
                        Reset Password
                        <span>
                          →
                        </span>
                      </>
                    )}
                </button>

              </form>


              <div className="reset-actions">

                <button
                  type="button"
                  className="reset-link-button"
                  onClick={
                    handleResendCode
                  }
                  disabled={loading}
                >
                  Resend code
                </button>

                <span>
                  •
                </span>

                <button
                  type="button"
                  className="reset-link-button"
                  onClick={returnToLogin}
                  disabled={loading}
                >
                  Back to Login
                </button>

              </div>
            </>
          )}

        </div>

      </section>

    </div>
  );
}


export default Login;