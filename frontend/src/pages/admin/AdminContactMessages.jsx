import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  getContactMessages,
  updateContactMessageStatus,
} from "../../services/api";

import {
  logoutUser,
} from "../../services/authService";

import "./AdminContactMessages.css";


function AdminContactMessages() {
  const navigate = useNavigate();

  const [messages, setMessages] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState(null);

  const [statusFilter, setStatusFilter] =
    useState("All");


  const loadMessages =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getContactMessages();

        setMessages(
          Array.isArray(response)
            ? response
            : response?.messages || []
        );

      } catch (err) {
        console.error(
          "CONTACT MESSAGES ERROR:",
          err
        );

        setError(
          err?.message ||
          "Unable to load contact messages."
        );

      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    loadMessages();
  }, []);


  const handleLogout =
    async () => {
      await logoutUser();

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    };


  const handleStatusChange =
    async (
      messageId,
      status
    ) => {
      try {
        setUpdatingId(
          messageId
        );

        setError("");

        await updateContactMessageStatus(
          messageId,
          status
        );

        setMessages(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                messageId
                  ? {
                      ...item,
                      status,
                    }
                  : item
            )
        );

      } catch (err) {
        setError(
          err?.message ||
          "Unable to update the message."
        );

      } finally {
        setUpdatingId(null);
      }
    };


  const filteredMessages =
    useMemo(
      () =>
        statusFilter === "All"
          ? messages
          : messages.filter(
              (item) =>
                item.status ===
                statusFilter
            ),
      [
        messages,
        statusFilter,
      ]
    );


  const newCount =
    messages.filter(
      (item) =>
        item.status === "New"
    ).length;

  const reviewedCount =
    messages.filter(
      (item) =>
        item.status === "Reviewed"
    ).length;

  const resolvedCount =
    messages.filter(
      (item) =>
        item.status === "Resolved"
    ).length;


  const formatDate =
    (value) => {
      if (!value) {
        return "—";
      }

      return new Date(
        value
      ).toLocaleString(
        "en-GB",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      );
    };


  return (
    <div className="contact-admin-page">

      <header className="contact-admin-header">

        <Link
          to="/"
          className="contact-admin-brand"
        >
          <strong>
            HelpIn
          </strong>

          <span>
            ADMINISTRATION
          </span>
        </Link>


        <div className="contact-admin-user">

          <div>
            <strong>
              HelpIn Admin
            </strong>

            <span>
              Admin
            </span>
          </div>

          <div className="contact-admin-avatar">
            HA
          </div>

          <button
            type="button"
            onClick={handleLogout}
          >
            ↪ Logout
          </button>

        </div>

      </header>


      <div className="contact-admin-body">

        <aside className="contact-admin-sidebar">

          <p>
            ADMIN WORKSPACE
          </p>

          <nav>

            <NavLink
              to="/admin"
              end
            >
              <span>▦</span>
              Dashboard
            </NavLink>

            <NavLink
              to="/admin/services"
            >
              <span>▤</span>
              Manage Services
            </NavLink>

            <NavLink
              to="/admin/jobs"
            >
              <span>▤</span>
              Manage Jobs
            </NavLink>

            <NavLink
              to="/admin/listings"
            >
              <span>▣</span>
              View Listings
            </NavLink>

            <NavLink
              to="/admin/contact-messages"
              className="active"
            >
              <span>✉</span>
              Contact Messages
            </NavLink>

            <NavLink
              to="/admin/logs"
            >
              <span>▤</span>
              Event Logs
            </NavLink>

          </nav>

        </aside>


        <main className="contact-admin-main">

          <section className="contact-admin-title">

            <div>
              <p>
                VISITOR SUPPORT
              </p>

              <h1>
                Contact Messages
              </h1>

              <span>
                Review messages sent through
                the public HelpIn contact form.
              </span>
            </div>

            <button
              type="button"
              onClick={loadMessages}
              disabled={loading}
            >
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>

          </section>


          {error && (
            <div className="contact-admin-error">
              {error}
            </div>
          )}


          <section className="contact-admin-stats">

            <article>
              <span>
                Total
              </span>

              <strong>
                {loading
                  ? "..."
                  : messages.length}
              </strong>
            </article>

            <article>
              <span>
                New
              </span>

              <strong>
                {loading
                  ? "..."
                  : newCount}
              </strong>
            </article>

            <article>
              <span>
                Reviewed
              </span>

              <strong>
                {loading
                  ? "..."
                  : reviewedCount}
              </strong>
            </article>

            <article>
              <span>
                Resolved
              </span>

              <strong>
                {loading
                  ? "..."
                  : resolvedCount}
              </strong>
            </article>

          </section>


          <section className="contact-admin-panel">

            <div className="contact-admin-toolbar">

              <div>
                <p>
                  INBOX
                </p>

                <h2>
                  Visitor messages
                </h2>
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
              >
                <option value="All">
                  All Statuses
                </option>

                <option value="New">
                  New
                </option>

                <option value="Reviewed">
                  Reviewed
                </option>

                <option value="Resolved">
                  Resolved
                </option>
              </select>

            </div>


            {loading ? (
              <div className="contact-admin-empty">
                Loading contact messages...
              </div>

            ) : filteredMessages.length === 0 ? (
              <div className="contact-admin-empty">
                No contact messages found.
              </div>

            ) : (
              <div className="contact-admin-list">

                {filteredMessages.map(
                  (item) => (

                    <article
                      key={item.id}
                      className="contact-message-card"
                    >

                      <div className="contact-message-top">

                        <div>
                          <span className="contact-message-reason">
                            {item.reason}
                          </span>

                          <h3>
                            {item.name ||
                              "Anonymous visitor"}
                          </h3>

                          <p className="contact-message-meta">
                            {item.email ||
                              "No reply email provided"}
                            {" · "}
                            {formatDate(
                              item.created_at
                            )}
                          </p>
                        </div>


                        <span
                          className={
                            `contact-message-status ${String(
                              item.status || "New"
                            ).toLowerCase()}`
                          }
                        >
                          {item.status ||
                            "New"}
                        </span>

                      </div>


                      <p className="contact-message-text">
                        {item.message}
                      </p>


                      <div className="contact-message-actions">

                        <label
                          htmlFor={
                            `message-status-${item.id}`
                          }
                        >
                          Status
                        </label>

                        <select
                          id={
                            `message-status-${item.id}`
                          }
                          value={
                            item.status ||
                            "New"
                          }
                          disabled={
                            updatingId ===
                            item.id
                          }
                          onChange={(event) =>
                            handleStatusChange(
                              item.id,
                              event.target.value
                            )
                          }
                        >
                          <option value="New">
                            New
                          </option>

                          <option value="Reviewed">
                            Reviewed
                          </option>

                          <option value="Resolved">
                            Resolved
                          </option>
                        </select>

                        {item.email && (
                          <a
                            href={
                              `mailto:${item.email}`
                            }
                          >
                            Reply by Email
                          </a>
                        )}

                      </div>

                    </article>

                  )
                )}

              </div>
            )}

          </section>

        </main>

      </div>

    </div>
  );
}


export default AdminContactMessages;
