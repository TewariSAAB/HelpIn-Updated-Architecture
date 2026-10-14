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
   ADMIN GROUP CHECK
====================================================== */

function isAdmin(event) {
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
   SAFE REQUEST LOGGING

   IMPORTANT:
   Do not log Authorization headers / Cognito JWTs.
====================================================== */

function logEventSummary(event) {
  if (
    Array.isArray(
      event?.Records
    )
  ) {
    console.log(
      "Event received:",
      {
        type: "SQS",
        recordCount:
          event.Records.length,
        eventSource:
          event.Records[0]
            ?.eventSource ||
          "unknown",
      }
    );

    return;
  }


  if (
    event?.httpMethod
  ) {
    console.log(
      "Event received:",
      {
        type:
          "API Gateway",

        method:
          event.httpMethod,

        path:
          event.path ||
          event.resource ||
          "unknown",
      }
    );

    return;
  }


  console.log(
    "Event received:",
    {
      type: "Unknown",
    }
  );
}


/* ======================================================
   BUILD HELPIN EVENT LOG
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
    detail.serviceName ??
    detail.service_name ??
    detail.jobTitle ??
    detail.job_title ??
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
   PROCESS SQS EVENTS
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


      const eventLog =
        buildEventLog(
          eventBridgeEvent
        );


      /*
        This is the marker searched by
        GET /admin/logs.
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
   PARSE CLOUDWATCH EVENT
====================================================== */

function parseCloudWatchEvent(
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


  const afterMarker =
    message.slice(
      markerPosition +
        marker.length
    );


  /*
    Lambda CloudWatch messages may contain
    formatting around the console output.

    Find the JSON object beginning after
    HELPIN_EVENT_LOG.
  */

  const firstBrace =
    afterMarker.indexOf(
      "{"
    );


  if (
    firstBrace === -1
  ) {
    return null;
  }


  const jsonStart =
    afterMarker.slice(
      firstBrace
    );


  /*
    Find the final closing brace.
  */

  const lastBrace =
    jsonStart.lastIndexOf(
      "}"
    );


  if (
    lastBrace === -1
  ) {
    return null;
  }


  const jsonText =
    jsonStart
      .slice(
        0,
        lastBrace + 1
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
      "Unable to parse HelpIn CloudWatch event:",
      error.message
    );


    return null;
  }
}


/* ======================================================
   READ REAL EVENT LOGS FROM CLOUDWATCH

   IMPORTANT:
   FilterLogEvents is paginated.

   CloudWatch can return an empty page while
   still providing nextToken, therefore every
   page must be followed.
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


  let nextToken =
    undefined;


  let previousToken =
    null;


  let pageCount =
    0;


  const rawEvents =
    [];


  do {
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

        nextToken,
      });


    const result =
      await logsClient.send(
        command
      );


    pageCount += 1;


    if (
      Array.isArray(
        result.events
      )
    ) {
      rawEvents.push(
        ...result.events
      );
    }


    previousToken =
      nextToken || null;


    nextToken =
      result.nextToken;


    /*
      AWS can occasionally return the
      same token again.

      Prevent an infinite loop.
    */

    if (
      nextToken &&
      previousToken &&
      nextToken ===
        previousToken
    ) {
      break;
    }


    /*
      Safety limit.

      More than enough for this project.
    */

    if (
      pageCount >= 50
    ) {
      console.warn(
        "CloudWatch pagination stopped after 50 pages."
      );

      break;
    }

  } while (
    nextToken
  );


  const parsedLogs =
    rawEvents
      .map(
        parseCloudWatchEvent
      )
      .filter(Boolean);


  /*
    Remove duplicates using EventBridge event ID.
  */

  const uniqueLogs =
    Array.from(
      new Map(
        parsedLogs.map(
          (log) => [
            log.eventId ||
              log.cloudWatchEventId,
            log,
          ]
        )
      ).values()
    );


  uniqueLogs.sort(
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


  console.log(
    "CloudWatch event-log search:",
    {
      logGroupName:
        EVENT_LOG_GROUP_NAME,

      pages:
        pageCount,

      rawMatches:
        rawEvents.length,

      parsedMatches:
        uniqueLogs.length,
    }
  );


  return uniqueLogs;
}


/* ======================================================
   API GATEWAY REQUEST
====================================================== */

async function processApiRequest(
  event
) {
  const method =
    event.httpMethod;


  /* ====================================================
     OPTIONS
  ==================================================== */

  if (
    method === "OPTIONS"
  ) {
    return apiResponse(
      200,
      {
        message:
          "OK",
      }
    );
  }


  /* ====================================================
     ADMIN AUTHORIZATION
  ==================================================== */

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


  /* ====================================================
     GET /admin/logs
  ==================================================== */

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

    /*
      Do NOT JSON.stringify the entire
      API Gateway event because it contains
      the Cognito Authorization token.
    */

    logEventSummary(
      event
    );


    /* ==================================================
       SQS
    ================================================== */

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


    /* ==================================================
       API GATEWAY
    ================================================== */

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
