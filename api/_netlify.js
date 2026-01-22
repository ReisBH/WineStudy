const { URL } = require('url');

const getRawBody = (req) => new Promise((resolve, reject) => {
  let data = '';
  req.on('data', (chunk) => {
    data += chunk;
  });
  req.on('end', () => resolve(data || null));
  req.on('error', reject);
});

const buildQueryParams = (searchParams) => {
  const params = {};
  for (const [key, value] of searchParams.entries()) {
    if (params[key]) {
      params[key] = Array.isArray(params[key]) ? [...params[key], value] : [params[key], value];
    } else {
      params[key] = value;
    }
  }
  return params;
};

const buildEvent = async (req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const body = await getRawBody(req);

  return {
    httpMethod: req.method,
    headers: req.headers,
    queryStringParameters: buildQueryParams(url.searchParams),
    body,
    path: url.pathname,
    isBase64Encoded: false
  };
};

const sendResponse = (res, result) => {
  const statusCode = result?.statusCode ?? 200;
  res.status(statusCode);

  if (result?.headers) {
    Object.entries(result.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
  }

  res.send(result?.body ?? '');
};

const handleNetlifyFunction = async (req, res, handler) => {
  try {
    const event = await buildEvent(req);
    const result = await handler(event, {});
    sendResponse(res, result);
  } catch (error) {
    console.error('Netlify adapter error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

module.exports = {
  handleNetlifyFunction
};
