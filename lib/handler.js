async function processImage(event, context) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': `application/json`,
      'Cache-Control': `max-age=${365 * 24 * 60 * 60}`,
      'Last-Modified': new Date().toUTCString(),
    },
    body: JSON.stringify({
      message: 'Hello world',
      env: process.env.NODE_ENV,
      event,
    }),
    isBase64Encoded: false,
  };
}

export { processImage };
