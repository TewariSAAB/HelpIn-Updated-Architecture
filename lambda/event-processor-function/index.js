const {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
} = require("@aws-sdk/client-cloudwatch-logs");


const logsClient =
  new CloudWatchLogsClient({});


const EVENT_LOG_GROUP_NAME =
  process.env.EVENT_LOG_GROUP_NAME;


const CORS_ALLOWED_ORIGIN =
  process.env.CORS_ALLOWED_ORIGIN || "*";


const REQUIRED_ADMIN_GROUP =
  process.env.REQUIRED_ADMIN_GROUP || "";


/* ======================================================
   API RESPONSE
====================================================== */

function apiResponse(
  statusCode,
  body
) {
  return {
    statusCode,

    headers: {
      "Content-Type":
        "application/json",

      "Access-Control-Allow-Origin":
        CORS_ALLOWED_ORIGIN,

      "Access-Control-Allow-Headers":
        "Content-Type,Authorization",

      "Access-Control-Allow-Methods":
        "GET,OPTIONS",
    },

    body:
      JSON.stringify(body),
  };
}


/* ======================================================
   CHECK ADMIN GROUP
====================================================== */

function isAdmin(event) {
  /*
    API Gateway Cognito User Pool authorizer
    makes token claims available here.
  */

  const claims =
    event?.requestContext
      ?.authorizer
      ?.claims || {};


  const groupsClaim =
    claims[
      "cognito:groups"
    ];


  if (
    !REQUIRED_ADMIN_GROUP
  ) {
    return true;
  }


  if (!groupsClaim) {
    return false;
  }


  let groups = [];


  if (
    Array.isArray(
      groupsClaim
    )
  ) {
    groups =
      groupsClaim;

  } else {
    groups =
      String(
        groupsClaim
      )
        .replace(
          /^\[/,
          ""
        )
        .replace(
          /\]$/,
          ""
        )
        .split(",")
        .map(
          (group) =>
            group
              .trim()
              .replace(
                /^["']|["']$/g,
                ""
              )
        )
        .filter(Boolean);
  }


  return groups.includes(
    REQUIRED_ADMIN_GROUP
  );
}


/* ======================================================
   NORMALISE EVENTBRIDGE EVENT
====================================================== */

function buildEventLog(
  eventBridgeEvent
) {
  const detail =
    eventBridgeEvent.detail || {};


  const eventType =
    eventBridgeEvent[
      "detail-type"
    ] ||
    "UnknownEvent";


  let entityType =
    "Unknown";


  if (
    eventType.startsWith(
      "Service"
    )
  ) {
    entityType =
      "Service";
  }


  if (
    eventType.startsWith(
      "Job"
    )
  ) {
    entityType =
      "Job";
  }


  const entityId =
    detail.serviceId ??
    detail.service_id ??
    detail.jobId ??
    detail.job_id ??
    detail.entityId ??
    detail.entity_id ??
    detail.id ??
    null;


  const entityName =
    detail.name ??
    detail.title ??
    detail.entityName ??
    detail.entity_name ??
    null;


  const performedBy =
    detail.username ??
    detail.user ??
    detail.admin ??
    detail.performedBy ??
    detail.performed_by ??
    "HelpIn Admin";


  return {
    eventId:
      eventBridgeEvent.id ||
      null,

    eventType,

    entityType,

    entityId,

    entityName,

    performedBy,

    timestamp:
      eventBridgeEvent.time ||
      new Date()
        .toISOString(),

    detail,
  };
}


/* ======================================================
   PROCESS SQS RECORDS
====================================================== */

async function processSqsEvent(
  event
) {
  const batchItemFailures =
    [];


  for (
    const record of
    event.Records || []
  ) {
    try {
      console.log(
        "SQS message received:",
        record.messageId
      );


      const eventBridgeEvent =
        JSON.parse(
          record.body
        );


      console.log(
        "EventBridge event:",
        JSON.stringify(
          eventBridgeEvent
        )
      );


      const eventLog =
        buildEventLog(
          eventBridgeEvent
        );


      /*
        This marker is intentionally unique.

        Later GET /admin/logs searches CloudWatch
        only for messages beginning with this marker.
      */

      console.log(
        `HELPIN_EVENT_LOG ${JSON.stringify(
          eventLog
        )}`
      );


      console.log(
        `Successfully processed ${eventLog.eventType}`
      );

    } catch (error) {
      console.error(
        "Unable to process SQS message:",
        record.messageId,
        error
      );


      batchItemFailures.push({
        itemIdentifier:
          record.messageId,
      });
    }
  }


  return {
    batchItemFailures,
  };
}


/* ======================================================
   PARSE CLOUDWATCH LOG ENTRY
====================================================== */

function parseEventLog(
  cloudWatchEvent
) {
  const message =
    cloudWatchEvent.message ||
    "";


  const marker =
    "HELPIN_EVENT_LOG ";


  const markerPosition =
    message.indexOf(
      marker
    );


  if (
    markerPosition === -1
  ) {
    return null;
  }


  const jsonText =
    message
      .slice(
        markerPosition +
          marker.length
      )
      .trim();


  try {
    const parsed =
      JSON.parse(
        jsonText
      );


    return {
      ...parsed,

      cloudWatchEventId:
        cloudWatchEvent.eventId ||
        null,

      cloudWatchTimestamp:
        cloudWatchEvent.timestamp ||
        null,
    };

  } catch (error) {
    console.error(
      "Unable to parse HelpIn event log:",
      error
    );

    return null;
  }
}


/* ======================================================
   READ REAL EVENT LOGS FROM CLOUDWATCH
====================================================== */

async function getEventLogs() {
  if (
    !EVENT_LOG_GROUP_NAME
  ) {
    throw new Error(
      "EVENT_LOG_GROUP_NAME is not configured."
    );
  }


  const thirtyDaysAgo =
    Date.now() -
    30 *
      24 *
      60 *
      60 *
      1000;


  const command =
    new FilterLogEventsCommand({
      logGroupName:
        EVENT_LOG_GROUP_NAME,

      startTime:
        thirtyDaysAgo,

      filterPattern:
        '"HELPIN_EVENT_LOG"',

      limit:
        100,
    });


  const result =
    await logsClient.send(
      command
    );


  const logs =
    (result.events || [])
      .map(
        parseEventLog
      )
      .filter(Boolean)
      .sort(
        (a, b) => {
          const aTime =
            new Date(
              a.timestamp ||
              a.cloudWatchTimestamp ||
              0
            ).getTime();


          const bTime =
            new Date(
              b.timestamp ||
              b.cloudWatchTimestamp ||
              0
            ).getTime();


          return (
            bTime -
            aTime
          );
        }
      );


  return logs;
}


/* ======================================================
   API GATEWAY REQUEST
====================================================== */

async function processApiRequest(
  event
) {
  const method =
    event.httpMethod;


  /* OPTIONS */

  if (
    method === "OPTIONS"
  ) {
    return apiResponse(
      200,
      {
        message: "OK",
      }
    );
  }


  /* ADMIN CHECK */

  if (
    !isAdmin(event)
  ) {
    return apiResponse(
      403,
      {
        message:
          "Admin access required.",
      }
    );
  }


  /* GET /admin/logs */

  if (
    method === "GET"
  ) {
    try {
      const logs =
        await getEventLogs();


      return apiResponse(
        200,
        {
          count:
            logs.length,

          logs,
        }
      );

    } catch (error) {
      console.error(
        "Unable to retrieve event logs:",
        error
      );


      return apiResponse(
        500,
        {
          message:
            "Unable to retrieve event logs.",

          error:
            error.message,
        }
      );
    }
  }


  return apiResponse(
    405,
    {
      message:
        "Method not allowed.",
    }
  );
}


/* ======================================================
   MAIN HANDLER
====================================================== */

exports.handler =
  async (event) => {

    console.log(
      "Event received:",
      JSON.stringify(
        event
      )
    );


    /* ================================================
       SQS EVENT
    ================================================ */

    if (
      Array.isArray(
        event?.Records
      ) &&
      event.Records.some(
        (record) =>
          record.eventSource ===
          "aws:sqs"
      )
    ) {
      return processSqsEvent(
        event
      );
    }


    /* ================================================
       API GATEWAY EVENT
    ================================================ */

    if (
      event?.httpMethod
    ) {
      return processApiRequest(
        event
      );
    }


    console.warn(
      "Unsupported EventProcessor event."
    );


    return {
      batchItemFailures: [],
    };
  };
