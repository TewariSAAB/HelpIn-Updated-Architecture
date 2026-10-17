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

import "./ManageServices.css";

import {
  createService,
  deleteService,
  getServices,
  updateService,
  uploadServiceImage,
} from "../../services/api";

import {
  logoutUser,
} from "../../services/authService";


const emptyForm = {
  name: "",
  category: "Accommodation",
  location: "",
  serviceType: "",
  price: "",
  costType: "Per Month",
  status: "Active",
  description: "",
  contactNumber: "",
  websiteUrl: "",
  openingHours: "",
  imageKey: "",
  imageUrl: "",
};


function ManageServices() {
  const navigate = useNavigate();

  const [services, setServices] =
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
    categoryFilter,
    setCategoryFilter,
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

  const [
    selectedImage,
    setSelectedImage,
  ] = useState(null);

  const [
    imagePreview,
    setImagePreview,
  ] = useState("");


  useEffect(() => {
    return () => {
      if (
        imagePreview &&
        imagePreview.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          imagePreview
        );
      }
    };
  }, [imagePreview]);


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
     FORMAT SERVICE RECEIVED FROM AWS
  ====================================================== */

  function formatService(service) {
    return {
      id:
        service.id,

      name:
        service.name || "",

      category:
        service.category || "",

      location:
        service.location || "",

      serviceType:
        service.service_type ||
        service.serviceType ||
        "",

      price:
        service.price ?? "",

      costType:
        service.cost_type ||
        service.costType ||
        "",

      status:
        normaliseStatus(
          service.status
        ),

      description:
        service.description || "",

      contactNumber:
        service.contact_number ||
        service.contactNumber ||
        "",

      websiteUrl:
        service.website_url ||
        service.websiteUrl ||
        "",

      openingHours:
        service.opening_hours ||
        service.openingHours ||
        "",

      imageKey:
        service.image_key ||
        service.imageKey ||
        "",

      imageUrl:
        service.image_url ||
        service.imageUrl ||
        "",
    };
  }


  /* ======================================================
     LOAD SERVICES
  ====================================================== */

  const loadServices =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getServices();

        const realServices =
          Array.isArray(response)
            ? response
            : response?.services || [];

        const formattedServices =
          realServices.map(
            formatService
          );

        console.log(
          "REAL SERVICES:",
          realServices
        );

        setServices(
          formattedServices
        );

      } catch (err) {
        console.error(
          "SERVICES API ERROR:",
          err
        );

        setError(
          "Unable to load services from AWS."
        );

      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    loadServices();
  }, []);


  /* ======================================================
     SEARCH / FILTER
  ====================================================== */

  const filteredServices =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return services.filter(
        (service) => {
          const name =
            String(
              service.name || ""
            ).toLowerCase();

          const location =
            String(
              service.location || ""
            ).toLowerCase();

          const serviceType =
            String(
              service.serviceType || ""
            ).toLowerCase();


          const matchesSearch =
            name.includes(query) ||
            location.includes(query) ||
            serviceType.includes(query);


          const matchesCategory =
            categoryFilter ===
              "All" ||
            service.category ===
              categoryFilter;


          return (
            matchesSearch &&
            matchesCategory
          );
        }
      );

    }, [
      services,
      search,
      categoryFilter,
    ]);


  /* ======================================================
     COUNTS
  ====================================================== */

  const accommodationCount =
    services.filter(
      (service) =>
        service.category ===
        "Accommodation"
    ).length;


  const foodCount =
    services.filter(
      (service) =>
        service.category ===
        "Food Support"
    ).length;


  /* ======================================================
     ADD MODAL
  ====================================================== */

  const openAddModal = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
    });

    setSelectedImage(null);
    setImagePreview("");

    setActionError("");
    setSuccessMessage("");

    setShowModal(true);
  };


  /* ======================================================
     EDIT MODAL
  ====================================================== */

  const openEditModal =
    (service) => {
      setEditingId(
        service.id
      );

      setActionError("");
      setSuccessMessage("");

      setForm({
        name:
          service.name || "",

        category:
          service.category ||
          "Accommodation",

        location:
          service.location || "",

        serviceType:
          service.serviceType || "",

        price:
          service.price ?? "",

        costType:
          service.costType ||
          "Per Month",

        status:
          service.status ||
          "Active",

        description:
          service.description || "",

        contactNumber:
          service.contactNumber || "",

        websiteUrl:
          service.websiteUrl || "",

        openingHours:
          service.openingHours || "",
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

    setSelectedImage(null);
    setImagePreview("");

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


      /* ----------------------------------------------
         COST TYPE = FREE
         Automatically make price 0
      ---------------------------------------------- */

      if (
        name === "costType" &&
        value === "Free"
      ) {
        setForm(
          (current) => ({
            ...current,
            costType: value,
            price: "0",
          })
        );

        return;
      }


      setForm(
        (current) => ({
          ...current,
          [name]: value,
        })
      );
    };


  /* ======================================================
     IMAGE CHANGE
  ====================================================== */

  const handleImageChange =
    (event) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (
        !allowedTypes.includes(
          file.type
        )
      ) {
        setActionError(
          "Choose a JPEG, PNG or WebP image."
        );

        event.target.value = "";
        return;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        setActionError(
          "Service images must be no larger than 5 MB."
        );

        event.target.value = "";
        return;
      }

      setActionError("");
      setSelectedImage(file);

      setImagePreview(
        URL.createObjectURL(file)
      );
    };


  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview("");

    setForm(
      (current) => ({
        ...current,
        imageKey: "",
        imageUrl: "",
      })
    );
  };


  /* ======================================================
     BUILD PAYLOAD FOR AWS

     IMPORTANT:
     Backend/RDS fields use snake_case.
  ====================================================== */

  function buildServicePayload(
    imageKey = form.imageKey
  ) {
    let websiteUrl =
      form.websiteUrl.trim();


    /* ----------------------------------------------
       Add https:// automatically
    ---------------------------------------------- */

    if (
      websiteUrl &&
      !websiteUrl.startsWith(
        "http://"
      ) &&
      !websiteUrl.startsWith(
        "https://"
      )
    ) {
      websiteUrl =
        `https://${websiteUrl}`;
    }


    /* ----------------------------------------------
       PRICE
    ---------------------------------------------- */

    const numericPrice =
      form.costType === "Free"
        ? 0
        : form.price === ""
          ? 0
          : Number(
              form.price
            );


    /* ----------------------------------------------
       SEND EXACT BACKEND COLUMN NAMES
    ---------------------------------------------- */

    return {
      name:
        form.name.trim(),

      category:
        form.category,

      location:
        form.location.trim(),

      description:
        form.description.trim(),

      price:
        numericPrice,

      cost_type:
        form.costType,

      service_type:
        form.serviceType.trim(),

      contact_number:
        form.contactNumber.trim(),

      website_url:
        websiteUrl,

      opening_hours:
        form.openingHours.trim(),

      image_url:
        imageKey || null,

      status:
        form.status,
    };
  }


  /* ======================================================
     ADD / UPDATE
  ====================================================== */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setActionError("");
      setSuccessMessage("");
      setSaving(true);


      try {
        let imageKey =
          form.imageKey || null;

        if (selectedImage) {
          const uploadedImage =
            await uploadServiceImage(
              selectedImage
            );

          imageKey =
            uploadedImage.imageKey;
        }

        const payload =
          buildServicePayload(
            imageKey
          );


        console.log(
          "SERVICE PAYLOAD:",
          payload
        );


        /* ================================================
           UPDATE
        ================================================ */

        if (editingId) {
          await updateService(
            editingId,
            payload
          );

          setSuccessMessage(
            "Service updated successfully."
          );

        } else {

          /* ==============================================
             CREATE
          ============================================== */

          await createService(
            payload
          );

          setSuccessMessage(
            "Service added successfully."
          );
        }


        setShowModal(false);

        setEditingId(null);

        setForm({
          ...emptyForm,
        });

        setSelectedImage(null);
        setImagePreview("");


        /* ================================================
           Reload actual data from RDS
        ================================================ */

        await loadServices();

      } catch (err) {
        console.error(
          "SERVICE SAVE ERROR:",
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
            "Unable to save the service."
          );
        }

      } finally {
        setSaving(false);
      }
    };


  /* ======================================================
     DELETE
  ====================================================== */

  const handleDelete =
    async (service) => {
      const confirmed =
        window.confirm(
          `Are you sure you want to permanently delete "${service.name}"?`
        );


      if (!confirmed) {
        return;
      }


      setActionError("");
      setSuccessMessage("");


      try {
        await deleteService(
          service.id
        );


        setSuccessMessage(
          `"${service.name}" was deleted successfully.`
        );


        await loadServices();

      } catch (err) {
        console.error(
          "SERVICE DELETE ERROR:",
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
            "Unable to delete the service."
          );
        }
      }
    };


  return (
    <div className="services-admin-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="services-admin-header">

        <Link
          to="/"
          className="services-admin-brand"
        >
          <svg
            className="services-admin-logo"
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


        <div className="services-admin-user">

          <div>
            <strong>
              HelpIn Admin
            </strong>

            <span>
              Admin
            </span>
          </div>


          <div className="services-admin-avatar">
            HA
          </div>


          <div className="services-admin-divider" />


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

      <div className="services-admin-body">

        {/* ==================================================
            SIDEBAR
        ================================================== */}

        <aside className="services-admin-sidebar">

          <p className="services-sidebar-heading">
            ADMIN WORKSPACE
          </p>


          <nav>

            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `services-sidebar-link ${
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
                `services-sidebar-link ${
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
                `services-sidebar-link ${
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
                `services-sidebar-link ${
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
              to="/admin/logs"
              className={({ isActive }) =>
                `services-sidebar-link ${
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

        <main className="services-admin-main">

          <section className="services-admin-title">

            <div>
              <p>
                SERVICE MANAGEMENT
              </p>

              <h1>
                Manage Services
              </h1>

              <span>
                Create, update and manage
                accommodation and food
                support listings.
              </span>
            </div>


            <button
              type="button"
              className="services-add-button"
              onClick={
                openAddModal
              }
            >
              <span>
                ＋
              </span>

              Add New Service
            </button>

          </section>


          {/* ==================================================
              SUCCESS
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

          <section className="services-admin-stats">

            <article className="services-stat-card blue">

              <div>
                <p>
                  Total Services
                </p>

                <strong>
                  {loading
                    ? "..."
                    : services.length}
                </strong>

                <span>
                  Across all categories
                </span>
              </div>


              <div className="services-stat-icon blue">
                ▣
              </div>

            </article>


            <article className="services-stat-card green">

              <div>
                <p>
                  Accommodation
                </p>

                <strong>
                  {loading
                    ? "..."
                    : accommodationCount}
                </strong>

                <span>
                  Housing listings
                </span>
              </div>


              <div className="services-stat-icon green">
                🏠
              </div>

            </article>


            <article className="services-stat-card purple">

              <div>
                <p>
                  Food Support
                </p>

                <strong>
                  {loading
                    ? "..."
                    : foodCount}
                </strong>

                <span>
                  Support listings
                </span>
              </div>


              <div className="services-stat-icon purple">
                🍲
              </div>

            </article>

          </section>


          {/* ==================================================
              LIST
          ================================================== */}

          <section className="services-list-card">

            <div className="services-list-header">

              <div>
                <p>
                  LISTINGS
                </p>

                <h2>
                  Service Listings
                </h2>

                <span>
                  View and manage all
                  HelpIn services.
                </span>
              </div>


              <div className="services-result-count">
                {loading
                  ? "Loading..."
                  : `${filteredServices.length} ${
                      filteredServices.length ===
                      1
                        ? "result"
                        : "results"
                    }`}
              </div>

            </div>


            {/* FILTERS */}

            <div className="services-filters">

              <div className="services-search">

                <span>⌕</span>

                <input
                  id="services-search"
                  name="servicesSearch"
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search services..."
                />

              </div>


              <select
                id="service-category-filter"
                name="serviceCategoryFilter"
                value={
                  categoryFilter
                }
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value
                  )
                }
              >

                <option value="All">
                  All Categories
                </option>

                <option value="Accommodation">
                  Accommodation
                </option>

                <option value="Food Support">
                  Food Support
                </option>

              </select>

            </div>


            {/* ==================================================
                TABLE
            ================================================== */}

            <div className="services-table-wrapper">

              <table className="services-table">

                <thead>
                  <tr>
                    <th>SERVICE</th>
                    <th>CATEGORY</th>
                    <th>LOCATION</th>
                    <th>TYPE</th>
                    <th>COST</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>


                <tbody>

                  {loading && (
                    <tr>
                      <td
                        colSpan="7"
                        className="services-empty"
                      >
                        Loading services from AWS...
                      </td>
                    </tr>
                  )}


                  {!loading &&
                    error && (
                      <tr>
                        <td
                          colSpan="7"
                          className="services-empty"
                        >
                          {error}
                        </td>
                      </tr>
                    )}


                  {!loading &&
                    !error &&
                    filteredServices.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan="7"
                          className="services-empty"
                        >
                          No services found.
                        </td>
                      </tr>
                    )}


                  {!loading &&
                    !error &&
                    filteredServices.map(
                      (service) => (
                        <tr
                          key={
                            service.id
                          }
                        >

                          <td>

                            <div className="services-name-cell">

                              <div className="services-name-icon">
                                {service.imageUrl ? (
                                  <img
                                    src={
                                      service.imageUrl
                                    }
                                    alt=""
                                    className="services-name-thumbnail"
                                  />
                                ) : (
                                  service.category ===
                                  "Accommodation"
                                    ? "🏠"
                                    : "🍲"
                                )}
                              </div>


                              <div>
                                <strong>
                                  {
                                    service.name
                                  }
                                </strong>

                                <span>
                                  ID #
                                  {
                                    service.id
                                  }
                                </span>
                              </div>

                            </div>

                          </td>


                          <td>
                            <span
                              className={`services-category ${
                                service.category ===
                                "Accommodation"
                                  ? "accommodation"
                                  : "food"
                              }`}
                            >
                              {
                                service.category
                              }
                            </span>
                          </td>


                          <td>
                            {
                              service.location
                            }
                          </td>


                          <td>
                            {service.serviceType ||
                              "—"}
                          </td>


                          <td>

                            {service.costType ===
                              "Free" ||
                            Number(
                              service.price
                            ) === 0 ? (

                              <span className="services-free">
                                Free
                              </span>

                            ) : (

                              <strong className="services-price">
                                £
                                {
                                  service.price
                                }

                                {service.costType && (
                                  <small>
                                    {" "}
                                    {
                                      service.costType
                                    }
                                  </small>
                                )}
                              </strong>

                            )}

                          </td>


                          <td>
                            <span
                              className={`services-status ${
                                service.status ===
                                "Active"
                                  ? "active"
                                  : "inactive"
                              }`}
                            >
                              <i />

                              {
                                service.status
                              }
                            </span>
                          </td>


                          <td>

                            <div className="services-row-actions">

                              <button
                                type="button"
                                className="services-edit-button"
                                onClick={() =>
                                  openEditModal(
                                    service
                                  )
                                }
                              >
                                Edit
                              </button>


                              <button
                                type="button"
                                className="services-delete-button"
                                onClick={() =>
                                  handleDelete(
                                    service
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
          MODAL
      ================================================== */}

      {showModal && (
        <div
          className="services-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <section className="services-modal">

            <header className="services-modal-header">

              <div>
                <p>
                  {editingId
                    ? "UPDATE LISTING"
                    : "CREATE LISTING"}
                </p>

                <h2>
                  {editingId
                    ? "Update Service"
                    : "Add New Service"}
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


            <form
              className="services-form"
              onSubmit={
                handleSubmit
              }
            >

              <div className="services-form-grid">

                {/* NAME */}

                <div className="services-form-field full">

                  <label htmlFor="service-name">
                    Service Name
                  </label>

                  <input
                    id="service-name"
                    type="text"
                    name="name"
                    value={
                      form.name
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

                <div className="services-form-field">

                  <label htmlFor="service-category">
                    Category
                  </label>

                  <select
                    id="service-category"
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
                  >
                    <option value="Accommodation">
                      Accommodation
                    </option>

                    <option value="Food Support">
                      Food Support
                    </option>
                  </select>

                </div>


                {/* LOCATION */}

                <div className="services-form-field">

                  <label htmlFor="service-location">
                    Location
                  </label>

                  <input
                    id="service-location"
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
                    required
                  />

                </div>


                {/* SERVICE TYPE */}

                <div className="services-form-field">

                  <label htmlFor="service-type">
                    Service Type
                  </label>

                  <input
                    id="service-type"
                    type="text"
                    name="serviceType"
                    value={
                      form.serviceType
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


                {/* STATUS */}

                <div className="services-form-field">

                  <label htmlFor="service-status">
                    Status
                  </label>

                  <select
                    id="service-status"
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


                {/* PRICE */}

                <div className="services-form-field">

                  <label htmlFor="service-price">
                    Price
                  </label>

                  <input
                    id="service-price"
                    type="number"
                    min="0"
                    step="0.01"
                    name="price"
                    value={
                      form.price
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      saving ||
                      form.costType ===
                        "Free"
                    }
                  />

                </div>


                {/* COST TYPE */}

                <div className="services-form-field">

                  <label htmlFor="service-cost-type">
                    Cost Type
                  </label>

                  <select
                    id="service-cost-type"
                    name="costType"
                    value={
                      form.costType
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      saving
                    }
                  >

                    <option value="Free">
                      Free
                    </option>

                    <option value="Per Month">
                      Per Month
                    </option>

                    <option value="Per Week">
                      Per Week
                    </option>

                    <option value="Per Day">
                      Per Day
                    </option>

                    <option value="One-off">
                      One-off
                    </option>

                    <option value="Low Cost">
                      Low Cost
                    </option>

                  </select>

                </div>


                {/* DESCRIPTION */}

                <div className="services-form-field full">

                  <label htmlFor="service-description">
                    Description
                  </label>

                  <textarea
                    id="service-description"
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
                    rows="4"
                    required
                  />

                </div>


                {/* CONTACT */}

                <div className="services-form-field">

                  <label htmlFor="service-contact">
                    Contact Number
                  </label>

                  <input
                    id="service-contact"
                    type="text"
                    name="contactNumber"
                    value={
                      form.contactNumber
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      saving
                    }
                    placeholder="e.g. 020 1234 5678"
                  />

                </div>


                {/* WEBSITE */}

                <div className="services-form-field">

                  <label htmlFor="service-website">
                    Website URL
                  </label>

                  <input
                    id="service-website"
                    type="text"
                    name="websiteUrl"
                    value={
                      form.websiteUrl
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      saving
                    }
                    placeholder="www.example.com"
                  />

                </div>


                {/* OPENING HOURS */}

                <div className="services-form-field full">

                  <label htmlFor="service-opening-hours">
                    Opening Hours
                  </label>

                  <input
                    id="service-opening-hours"
                    type="text"
                    name="openingHours"
                    value={
                      form.openingHours
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      saving
                    }
                    placeholder="e.g. 9:00am - 5:00pm"
                  />

                </div>


                {/* SERVICE IMAGE */}

                <div className="services-form-field full">

                  <label htmlFor="service-image">
                    Service Image
                  </label>

                  <div className="services-image-upload">

                    <div className="services-image-preview">

                      {(
                        imagePreview ||
                        form.imageUrl
                      ) ? (
                        <img
                          src={
                            imagePreview ||
                            form.imageUrl
                          }
                          alt="Service preview"
                        />
                      ) : (
                        <div className="services-image-placeholder">
                          <span>🖼️</span>
                          <strong>
                            No image selected
                          </strong>
                        </div>
                      )}

                    </div>


                    <div className="services-image-controls">

                      <label
                        htmlFor="service-image"
                        className="services-image-choose"
                      >
                        {(
                          imagePreview ||
                          form.imageUrl
                        )
                          ? "Replace Image"
                          : "Choose Image"}
                      </label>

                      <input
                        id="service-image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={
                          handleImageChange
                        }
                        disabled={
                          saving
                        }
                      />

                      {(
                        imagePreview ||
                        form.imageUrl ||
                        form.imageKey
                      ) && (
                        <button
                          type="button"
                          className="services-image-remove"
                          onClick={
                            handleRemoveImage
                          }
                          disabled={
                            saving
                          }
                        >
                          Remove Image
                        </button>
                      )}

                      <p>
                        JPEG, PNG or WebP.
                        Maximum size 5 MB.
                      </p>

                    </div>

                  </div>

                </div>

              </div>


              {/* ==================================================
                  ACTIONS
              ================================================== */}

              <div className="services-form-actions">

                <button
                  type="button"
                  className="services-cancel"
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
                  className="services-save"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Add Service"}
                </button>

              </div>

            </form>

          </section>

        </div>
      )}

    </div>
  );
}


export default ManageServices;