import {
  getAccessToken,
  getIdToken,
} from "./authService";


const API_BASE_URL =
  "https://ln4gu0hczc.execute-api.us-east-1.amazonaws.com/prod";


/* ======================================================
   AUTH TOKEN
====================================================== */

function getAuthToken() {
  return (
    getIdToken() ||
    getAccessToken() ||
    ""
  );
}


/* ======================================================
   API REQUEST
====================================================== */

async function apiRequest(
  endpoint,
  options = {}
) {
  const {
    auth = false,
    body,
    headers = {},
    ...fetchOptions
  } = options;


  const requestHeaders = {
    ...headers,
  };


  /*
    Only add Content-Type when sending a body.
  */

  if (body !== undefined) {
    requestHeaders[
      "Content-Type"
    ] = "application/json";
  }


  /*
    Protected admin API routes
  */

  if (auth) {
    const token =
      getAuthToken();


    if (!token) {
      const error =
        new Error(
          "You are not logged in."
        );

      error.status = 401;

      throw error;
    }


    /*
      IMPORTANT:
      Your API Gateway Cognito authorizer
      expects the token directly.

      Do NOT add "Bearer ".
    */

    requestHeaders.Authorization =
      token;
  }


  const response =
    await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...fetchOptions,

        headers:
          requestHeaders,

        body:
          body !== undefined
            ? JSON.stringify(body)
            : undefined,
      }
    );


  const text =
    await response.text();


  let data = null;


  if (text) {
    try {
      data =
        JSON.parse(text);
    } catch {
      data = text;
    }
  }


  if (!response.ok) {
    let message =
      `Request failed with status ${response.status}.`;


    if (
      data &&
      typeof data === "object"
    ) {
      message =
        data.message ||
        data.error ||
        message;
    }


    if (
      typeof data === "string" &&
      data.trim()
    ) {
      message = data;
    }


    const error =
      new Error(message);


    error.status =
      response.status;


    error.data =
      data;


    throw error;
  }


  return data;
}


/* ======================================================
   SERVICES
====================================================== */

export async function getServices() {
  return apiRequest(
    "/services",
    {
      method: "GET",
    }
  );
}


export async function getServiceById(
  id
) {
  return apiRequest(
    `/services/${encodeURIComponent(
      id
    )}`,
    {
      method: "GET",
    }
  );
}


/* ======================================================
   SERVICE ADMIN CRUD
====================================================== */

export async function createService(
  service
) {
  return apiRequest(
    "/services",
    {
      method: "POST",
      auth: true,
      body: service,
    }
  );
}


export async function updateService(
  id,
  service
) {
  return apiRequest(
    `/services/${encodeURIComponent(
      id
    )}`,
    {
      method: "PUT",
      auth: true,
      body: service,
    }
  );
}


export async function deleteService(
  id
) {
  return apiRequest(
    `/services/${encodeURIComponent(
      id
    )}`,
    {
      method: "DELETE",
      auth: true,
    }
  );
}


// Request a signed upload URL, then send the image directly to S3.
export async function uploadServiceImage(
  file
) {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  const maxSize =
    5 * 1024 * 1024;

  if (
    !file ||
    !allowedTypes.includes(
      file.type
    )
  ) {
    throw new Error(
      "Choose a JPEG, PNG or WebP image."
    );
  }

  if (file.size > maxSize) {
    throw new Error(
      "Service images must be no larger than 5 MB."
    );
  }

  const uploadDetails =
    await apiRequest(
      "/admin/service-image-upload",
      {
        method: "POST",
        auth: true,
        body: {
          file_name:
            file.name,
          content_type:
            file.type,
          file_size:
            file.size,
        },
      }
    );

  if (
    !uploadDetails?.upload_url ||
    !uploadDetails?.image_key
  ) {
    throw new Error(
      "The image upload could not be prepared."
    );
  }

  const uploadResponse =
    await fetch(
      uploadDetails.upload_url,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            file.type,
        },
        body: file,
      }
    );

  if (!uploadResponse.ok) {
    throw new Error(
      "The image could not be uploaded to storage."
    );
  }

  return {
    imageKey:
      uploadDetails.image_key,
  };
}


/* ======================================================
   JOBS
====================================================== */

export async function getJobs() {
  return apiRequest(
    "/jobs",
    {
      method: "GET",
    }
  );
}


export async function getJobById(
  id
) {
  return apiRequest(
    `/jobs/${encodeURIComponent(
      id
    )}`,
    {
      method: "GET",
    }
  );
}


/* ======================================================
   JOB ADMIN CRUD
====================================================== */

export async function createJob(
  job
) {
  return apiRequest(
    "/jobs",
    {
      method: "POST",
      auth: true,
      body: job,
    }
  );
}


export async function updateJob(
  id,
  job
) {
  return apiRequest(
    `/jobs/${encodeURIComponent(
      id
    )}`,
    {
      method: "PUT",
      auth: true,
      body: job,
    }
  );
}


export async function deleteJob(
  id
) {
  return apiRequest(
    `/jobs/${encodeURIComponent(
      id
    )}`,
    {
      method: "DELETE",
      auth: true,
    }
  );
}


/* ======================================================
   RECOMMENDATIONS
====================================================== */

export async function getRecommendations(
  params = {}
) {
  const searchParams =
    new URLSearchParams();


  Object.entries(
    params
  ).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        searchParams.set(
          key,
          String(value)
        );
      }
    }
  );


  const query =
    searchParams.toString();


  return apiRequest(
    `/recommendations${
      query
        ? `?${query}`
        : ""
    }`,
    {
      method: "GET",
    }
  );
}



/* ======================================================
   REAL ADMIN EVENT LOGS
====================================================== */

export async function getAdminLogs() {
  return apiRequest(
    "/admin/logs",
    {
      method: "GET",
      auth: true,
    }
  );
}