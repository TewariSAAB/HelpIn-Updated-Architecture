exports.handler = async (event) => {
  console.log("Event received:", JSON.stringify(event, null, 2));

  for (const record of event.Records || []) {
    console.log("SQS message body:", record.body);
  }

  return {
    batchItemFailures: []
  };
};
