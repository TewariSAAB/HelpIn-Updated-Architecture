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

import "./ManageJobs.css";

import {
  createJob,
  deleteJob,
  getJobs,
  updateJob,
} from "../../services/api";

import {
  logoutUser,
} from "../../services/authService";


const emptyForm = {
  title: "",
  company: "",
  category: "",
  jobType: "Part-time",
  location: "",
  pay: "",
  experienceRequirement: "",
  status: "Active",
  description: "",
  externalUrl: "",
};


function ManageJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    actionError,
    setActionError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [
    typeFilter,
    setTypeFilter,
  ] = useState("All");

  const [
    showModal,
    setShowModal,
  ] = useState(false);

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const [form, setForm] =
    useState(emptyForm);


  /* ======================================================
     LOGOUT
  ====================================================== */

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


  /* ======================================================
     NORMALISE STATUS
  ====================================================== */

  function normaliseStatus(status) {
    if (!status) {
      return "Active";
    }

    const value =
      String(status)
        .toLowerCase();

    if (value === "active") {
      return "Active";
    }

    if (value === "inactive") {
      return "Inactive";
    }

    return status;
  }


  /* ======================================================
     FORMAT AWS JOB
  ====================================================== */

  function formatJob(job) {
    return {
      id:
        job.id,

      title:
        job.title || "",

      company:
        job.company || "",

      category:
        job.category || "",

      jobType:
        job.job_type ||
        job.jobType ||
        "",

      location:
        job.location || "",

      pay:
        job.pay || "",

      experienceRequirement:
        job.experience_requirement ||
        job.experienceRequirement ||
        "",

      status:
        normaliseStatus(
          job.status
        ),

      description:
        job.description || "",

      externalUrl:
        job.external_url ||
        job.externalUrl ||
        "",
    };
  }


  /* ======================================================
     LOAD JOBS FROM AWS
  ====================================================== */

  const loadJobs =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getJobs();

        const realJobs =
          Array.isArray(response)
            ? response
            : response?.jobs || [];

        console.log(
          "REAL JOBS:",
          realJobs
        );

        setJobs(
          realJobs.map(
            formatJob
          )
        );

      } catch (err) {
        console.error(
          "JOBS API ERROR:",
          err
        );

        setError(
          "Unable to load jobs from AWS."
        );

      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    loadJobs();
  }, []);


  /* ======================================================
     FILTER
  ====================================================== */

  const filteredJobs =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return jobs.filter(
        (job) => {
          const title =
            String(
              job.title || ""
            ).toLowerCase();

          const company =
            String(
              job.company || ""
            ).toLowerCase();

          const location =
            String(
              job.location || ""
            ).toLowerCase();

          const category =
            String(
              job.category || ""
            ).toLowerCase();

          const experience =
            String(
              job.experienceRequirement ||
              ""
            ).toLowerCase();


          const matchesSearch =
            title.includes(query) ||
            company.includes(query) ||
            location.includes(query) ||
            category.includes(query) ||
            experience.includes(query);


          const matchesType =
            typeFilter === "All" ||
            job.jobType ===
              typeFilter;


          return (
            matchesSearch &&
            matchesType
          );
        }
      );

    }, [
      jobs,
      search,
      typeFilter,
    ]);


  /* ======================================================
     COUNTS
  ====================================================== */

  const fullTimeCount =
    jobs.filter(
      (job) =>
        job.jobType ===
        "Full-time"
    ).length;


  const partTimeCount =
    jobs.filter(
      (job) =>
        job.jobType ===
        "Part-time"
    ).length;


  /* ======================================================
     ADD
  ====================================================== */

  const openAddModal = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
    });

    setActionError("");
    setSuccessMessage("");

    setShowModal(true);
  };


  /* ======================================================
     EDIT
  ====================================================== */

  const openEditModal =
    (job) => {
      setEditingId(
        job.id
      );

      setActionError("");
      setSuccessMessage("");

      setForm({
        title:
          job.title || "",

        company:
          job.company || "",

        category:
          job.category || "",

        jobType:
          job.jobType ||
          "Part-time",

        location:
          job.location || "",

        pay:
          job.pay || "",

        experienceRequirement:
          job.experienceRequirement ||
          "",

        status:
          job.status ||
          "Active",

        description:
          job.description || "",

        externalUrl:
          job.externalUrl || "",
      });

      setShowModal(true);
    };


  /* ======================================================
     CLOSE MODAL
  ====================================================== */

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);

    setEditingId(null);

    setForm({
      ...emptyForm,
    });

    setActionError("");
  };


  /* ======================================================
     FORM CHANGE
  ====================================================== */

  const handleChange =
    (event) => {
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


  /* ======================================================
     BUILD BACKEND PAYLOAD

     IMPORTANT:
     Backend uses snake_case field names.
  ====================================================== */

  function buildJobPayload() {
    let externalUrl =
      form.externalUrl.trim();


    /* Automatically add https:// */

    if (
      externalUrl &&
      !externalUrl.startsWith(
        "http://"
      ) &&
      !externalUrl.startsWith(
        "https://"
      )
    ) {
      externalUrl =
        `https://${externalUrl}`;
    }


    return {
      title:
        form.title.trim(),

      company:
        form.company.trim(),

      category:
        form.category.trim(),

      job_type:
        form.jobType,

      location:
        form.location.trim(),

      pay:
        form.pay.trim(),

      description:
        form.description.trim(),

      experience_requirement:
        form.experienceRequirement.trim(),

      external_url:
        externalUrl,

      status:
        form.status,
    };
  }


  /* ======================================================
     REAL CREATE / UPDATE
  ====================================================== */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setActionError("");
      setSuccessMessage("");

      setSaving(true);


      try {
        const payload =
          buildJobPayload();


        console.log(
          "JOB PAYLOAD:",
          payload
        );


        /* UPDATE */

        if (editingId) {
          await updateJob(
            editingId,
            payload
          );

          setSuccessMessage(
            "Job updated successfully."
          );

        } else {

          /* CREATE */

          await createJob(
            payload
          );

          setSuccessMessage(
            "Job added successfully."
          );
        }


        setShowModal(false);

        setEditingId(null);

        setForm({
          ...emptyForm,
        });


        /* Reload real RDS data */

        await loadJobs();

      } catch (err) {
        console.error(
          "JOB SAVE ERROR:",
          err
        );


        if (
          err?.status === 401 ||
          err?.status === 403
        ) {
          setActionError(
            "Your admin session is not authorised. Please login again."
          );

        } else {
          setActionError(
            err?.message ||
            "Unable to save the job."
          );
        }

      } finally {
        setSaving(false);
      }
    };


  /* ======================================================
     REAL DELETE
  ====================================================== */

  const handleDelete =
    async (job) => {
      const confirmed =
        window.confirm(
          `Are you sure you want to permanently delete "${job.title}"?`
        );


      if (!confirmed) {
        return;
      }


      setActionError("");
      setSuccessMessage("");


      try {
        await deleteJob(
          job.id
        );


        setSuccessMessage(
          `"${job.title}" was deleted successfully.`
        );


        await loadJobs();

      } catch (err) {
        console.error(
          "JOB DELETE ERROR:",
          err
        );


        if (
          err?.status === 401 ||
          err?.status === 403
        ) {
          setActionError(
            "Your admin session is not authorised. Please login again."
          );

        } else {
          setActionError(
            err?.message ||
            "Unable to delete the job."
          );
        }
      }
    };


  return (
    <div className="jobs-admin-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="jobs-admin-header">

        <Link
          to="/"
          className="jobs-admin-brand"
        >
          <svg
            className="jobs-admin-logo"
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


          <div>
            <strong>
              HelpIn
            </strong>

            <span>
              ADMINISTRATION
            </span>
          </div>

        </Link>


        <div className="jobs-admin-user">

          <div>
            <strong>
              HelpIn Admin
            </strong>

            <span>
              Admin
            </span>
          </div>


          <div className="jobs-admin-avatar">
            HA
          </div>


          <div className="jobs-admin-divider" />


          <button
            type="button"
            onClick={
              handleLogout
            }
          >
            ↪ Logout
          </button>

        </div>

      </header>


      {/* ==================================================
          BODY
      ================================================== */}

      <div className="jobs-admin-body">

        {/* SIDEBAR */}

        <aside className="jobs-admin-sidebar">

          <p className="jobs-sidebar-heading">
            ADMIN WORKSPACE
          </p>


          <nav>

            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `jobs-sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >
              <span>▦</span>

              Dashboard
            </NavLink>


            <NavLink
              to="/admin/services"
              className={({ isActive }) =>
                `jobs-sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >
              <span>▤</span>

              Manage Services
            </NavLink>


            <NavLink
              to="/admin/jobs"
              className={({ isActive }) =>
                `jobs-sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >
              <span>▤</span>

              Manage Jobs
            </NavLink>


            <NavLink
              to="/admin/listings"
              className={({ isActive }) =>
                `jobs-sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >
              <span>▤</span>

              View Listings
            </NavLink>


            <NavLink
              to="/admin/contact-messages"
              className={({ isActive }) =>
                `jobs-sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >

              <span>✉</span>

              Contact Messages

            </NavLink>


            <NavLink
              to="/admin/logs"
              className={({ isActive }) =>
                `jobs-sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >
              <span>▤</span>

              Event Logs
            </NavLink>

          </nav>

        </aside>


        {/* ==================================================
            MAIN
        ================================================== */}

        <main className="jobs-admin-main">

          <section className="jobs-admin-title">

            <div>

              <p>
                JOB MANAGEMENT
              </p>


              <h1>
                Manage Jobs
              </h1>


              <span>
                Create, update and manage
                beginner-friendly employment
                opportunities.
              </span>

            </div>


            <button
              type="button"
              className="jobs-add-button"
              onClick={
                openAddModal
              }
            >
              <span>
                ＋
              </span>

              Add New Job
            </button>

          </section>


          {/* ==================================================
              SUCCESS MESSAGE
          ================================================== */}

          {successMessage && (
            <div
              style={{
                marginBottom:
                  "18px",

                padding:
                  "13px 16px",

                border:
                  "1px solid #bde8d2",

                borderRadius:
                  "10px",

                background:
                  "#edf9f3",

                color:
                  "#147a4c",

                fontSize:
                  "13px",

                fontWeight:
                  "700",
              }}
            >
              {successMessage}
            </div>
          )}


          {/* ==================================================
              ERROR
          ================================================== */}

          {actionError &&
            !showModal && (
              <div
                style={{
                  marginBottom:
                    "18px",

                  padding:
                    "13px 16px",

                  border:
                    "1px solid #ffc7c7",

                  borderRadius:
                    "10px",

                  background:
                    "#fff3f3",

                  color:
                    "#c43d3d",

                  fontSize:
                    "13px",

                  fontWeight:
                    "700",
                }}
              >
                {actionError}
              </div>
            )}


          {/* ==================================================
              STATS
          ================================================== */}

          <section className="jobs-admin-stats">

            <article className="jobs-stat-card blue">

              <div>
                <p>
                  Total Jobs
                </p>

                <strong>
                  {loading
                    ? "..."
                    : jobs.length}
                </strong>

                <span>
                  All job listings
                </span>
              </div>


              <div className="jobs-stat-icon blue">
                💼
              </div>

            </article>


            <article className="jobs-stat-card green">

              <div>
                <p>
                  Full-time
                </p>

                <strong>
                  {loading
                    ? "..."
                    : fullTimeCount}
                </strong>

                <span>
                  Full-time opportunities
                </span>
              </div>


              <div className="jobs-stat-icon green">
                ◷
              </div>

            </article>


            <article className="jobs-stat-card purple">

              <div>
                <p>
                  Part-time
                </p>

                <strong>
                  {loading
                    ? "..."
                    : partTimeCount}
                </strong>

                <span>
                  Flexible opportunities
                </span>
              </div>


              <div className="jobs-stat-icon purple">
                ◴
              </div>

            </article>

          </section>


          {/* ==================================================
              LIST
          ================================================== */}

          <section className="jobs-list-card">

            <div className="jobs-list-header">

              <div>

                <p>
                  LISTINGS
                </p>


                <h2>
                  Job Listings
                </h2>


                <span>
                  View and manage all HelpIn
                  job opportunities.
                </span>

              </div>


              <div className="jobs-result-count">

                {loading
                  ? "Loading..."
                  : `${filteredJobs.length} ${
                      filteredJobs.length ===
                      1
                        ? "result"
                        : "results"
                    }`}

              </div>

            </div>


            {/* ==================================================
                FILTERS
            ================================================== */}

            <div className="jobs-filters">

              <div className="jobs-search">

                <span>
                  ⌕
                </span>


                <input
                  id="jobs-search"
                  name="jobsSearch"
                  type="text"
                  value={
                    search
                  }
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search jobs, companies or locations..."
                />

              </div>


              <select
                id="job-type-filter"
                name="jobTypeFilter"
                value={
                  typeFilter
                }
                onChange={(event) =>
                  setTypeFilter(
                    event.target.value
                  )
                }
              >

                <option value="All">
                  All Job Types
                </option>

                <option value="Full-time">
                  Full-time
                </option>

                <option value="Part-time">
                  Part-time
                </option>

              </select>

            </div>


            {/* ==================================================
                TABLE
            ================================================== */}

            <div className="jobs-table-wrapper">

              <table className="jobs-admin-table">

                <thead>
                  <tr>
                    <th>JOB</th>
                    <th>CATEGORY</th>
                    <th>LOCATION</th>
                    <th>TYPE</th>
                    <th>PAY</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>


                <tbody>

                  {loading && (
                    <tr>
                      <td
                        colSpan="7"
                        className="jobs-admin-empty"
                      >
                        Loading jobs from AWS...
                      </td>
                    </tr>
                  )}


                  {!loading &&
                    error && (
                      <tr>
                        <td
                          colSpan="7"
                          className="jobs-admin-empty"
                        >
                          {error}
                        </td>
                      </tr>
                    )}


                  {!loading &&
                    !error &&
                    filteredJobs.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan="7"
                          className="jobs-admin-empty"
                        >
                          No jobs found.
                        </td>
                      </tr>
                    )}


                  {!loading &&
                    !error &&
                    filteredJobs.map(
                      (job) => (
                        <tr
                          key={
                            job.id
                          }
                        >

                          {/* JOB */}

                          <td>

                            <div className="jobs-name-cell">

                              <div className="jobs-name-icon">
                                💼
                              </div>


                              <div>

                                <strong>
                                  {
                                    job.title
                                  }
                                </strong>


                                <span>
                                  {
                                    job.company
                                  }
                                </span>


                                <small>
                                  ID #
                                  {
                                    job.id
                                  }
                                </small>

                              </div>

                            </div>

                          </td>


                          {/* CATEGORY */}

                          <td>
                            <span className="jobs-category-badge">
                              {job.category ||
                                "—"}
                            </span>
                          </td>


                          {/* LOCATION */}

                          <td>
                            {job.location ||
                              "—"}
                          </td>


                          {/* TYPE */}

                          <td>
                            <span
                              className={`jobs-type-badge ${
                                job.jobType ===
                                "Full-time"
                                  ? "full"
                                  : "part"
                              }`}
                            >
                              {job.jobType ||
                                "—"}
                            </span>
                          </td>


                          {/* PAY */}

                          <td>
                            <strong className="jobs-pay">
                              {job.pay ||
                                "—"}
                            </strong>
                          </td>


                          {/* STATUS */}

                          <td>
                            <span
                              className={`jobs-status ${
                                job.status ===
                                "Active"
                                  ? "active"
                                  : "inactive"
                              }`}
                            >
                              <i />

                              {
                                job.status
                              }
                            </span>
                          </td>


                          {/* ACTIONS */}

                          <td>

                            <div className="jobs-row-actions">

                              <button
                                type="button"
                                className="jobs-admin-edit"
                                onClick={() =>
                                  openEditModal(
                                    job
                                  )
                                }
                              >
                                Edit
                              </button>


                              <button
                                type="button"
                                className="jobs-admin-delete"
                                onClick={() =>
                                  handleDelete(
                                    job
                                  )
                                }
                              >
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>
                      )
                    )}

                </tbody>

              </table>

            </div>

          </section>

        </main>

      </div>


      {/* ==================================================
          ADD / EDIT MODAL
      ================================================== */}

      {showModal && (
        <div
          className="jobs-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <section className="jobs-modal">

            <header className="jobs-modal-header">

              <div>

                <p>
                  {editingId
                    ? "UPDATE JOB"
                    : "CREATE JOB"}
                </p>


                <h2>
                  {editingId
                    ? "Update Job Listing"
                    : "Add New Job"}
                </h2>

              </div>


              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={
                  saving
                }
              >
                ×
              </button>

            </header>


            {/* MODAL ERROR */}

            {actionError && (
              <div
                style={{
                  margin:
                    "0 24px 18px",

                  padding:
                    "12px 14px",

                  border:
                    "1px solid #ffc7c7",

                  borderRadius:
                    "9px",

                  background:
                    "#fff3f3",

                  color:
                    "#c43d3d",

                  fontSize:
                    "12px",

                  fontWeight:
                    "700",
                }}
              >
                {actionError}
              </div>
            )}


            {/* ==================================================
                FORM
            ================================================== */}

            <form
              className="jobs-admin-form"
              onSubmit={
                handleSubmit
              }
            >

              <div className="jobs-form-grid">

                {/* TITLE */}

                <div className="jobs-form-field full">

                  <label htmlFor="job-title">
                    Job Title
                  </label>


                  <input
                    id="job-title"
                    type="text"
                    name="title"
                    value={
                      form.title
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      saving
                    }
                    required
                  />

                </div>


                {/* COMPANY */}

                <div className="jobs-form-field">

                  <label htmlFor="job-company">
                    Company
                  </label>


                  <input
                    id="job-company"
                    type="text"
                    name="company"
                    value={
                      form.company
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      saving
                    }
                    required
                  />

                </div>


                {/* CATEGORY */}

                <div className="jobs-form-field">

                  <label htmlFor="job-category">
                    Category
                  </label>


                  <input
                    id="job-category"
                    type="text"
                    name="category"
                    value={
                      form.category
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      saving
                    }
                    placeholder="e.g. Retail"
                    required
                  />

                </div>


                {/* LOCATION */}

                <div className="jobs-form-field">

                  <label htmlFor="job-location">
                    Location
                  </label>


                  <input
                    id="job-location"
                    type="text"
                    name="location"
                    value={
                      form.location
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      saving
                    }
                    placeholder="e.g. London"
                    required
                  />

                </div>


                {/* JOB TYPE */}

                <div className="jobs-form-field">

                  <label htmlFor="job-type">
                    Job Type
                  </label>


                  <select
                    id="job-type"
                    name="jobType"
                    value={
                      form.jobType
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      saving
                    }
                  >

                    <option value="Full-time">
                      Full-time
                    </option>

                    <option value="Part-time">
                      Part-time
                    </option>

                  </select>

                </div>


                {/* PAY */}

                <div className="jobs-form-field">

                  <label htmlFor="job-pay">
                    Pay
                  </label>


                  <input
                    id="job-pay"
                    type="text"
                    name="pay"
                    value={
                      form.pay
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      saving
                    }
                    placeholder="e.g. £12.50/hr"
                    required
                  />

                </div>


                {/* STATUS */}

                <div className="jobs-form-field">

                  <label htmlFor="job-status">
                    Status
                  </label>


                  <select
                    id="job-status"
                    name="status"
                    value={
                      form.status
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      saving
                    }
                  >

                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>

                  </select>

                </div>


                {/* EXPERIENCE */}

                <div className="jobs-form-field full">

                  <label htmlFor="job-experience">
                    Experience Requirement
                  </label>


                  <input
                    id="job-experience"
                    type="text"
                    name="experienceRequirement"
                    value={
                      form.experienceRequirement
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      saving
                    }
                    placeholder="e.g. No experience required"
                  />

                </div>


                {/* DESCRIPTION */}

                <div className="jobs-form-field full">

                  <label htmlFor="job-description">
                    Job Description
                  </label>


                  <textarea
                    id="job-description"
                    name="description"
                    value={
                      form.description
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      saving
                    }
                    rows="5"
                    required
                  />

                </div>


                {/* EXTERNAL URL */}

                <div className="jobs-form-field full">

                  <label htmlFor="job-url">
                    External Application URL
                  </label>


                  <input
                    id="job-url"
                    type="text"
                    name="externalUrl"
                    value={
                      form.externalUrl
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      saving
                    }
                    placeholder="www.company.com/apply"
                  />

                </div>

              </div>


              {/* ==================================================
                  ACTIONS
              ================================================== */}

              <div className="jobs-form-actions">

                <button
                  type="button"
                  className="jobs-admin-cancel"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="jobs-admin-save"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Add Job"}
                </button>

              </div>

            </form>

          </section>

        </div>
      )}

    </div>
  );
}


export default ManageJobs;