function success(data, statusCode = 200) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Credentials': 'true'
    },
    body: JSON.stringify(data)
  };
}

function error(message, statusCode = 400) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Credentials': 'true'
    },
    body: JSON.stringify({ detail: message })
  };
}

function setCookie(response, name, value, options = {}) {
  const defaults = {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  };
  const opts = { ...defaults, ...options };
  
  let cookie = `${name}=${value}`;
  if (opts.httpOnly) cookie += '; HttpOnly';
  if (opts.secure) cookie += '; Secure';
  if (opts.sameSite) cookie += `; SameSite=${opts.sameSite}`;
  if (opts.path) cookie += `; Path=${opts.path}`;
  if (opts.maxAge) cookie += `; Max-Age=${opts.maxAge}`;
  
  response.headers = response.headers || {};
  response.headers['Set-Cookie'] = cookie;
  return response;
}

function parseBody(event) {
  try {
    return event.body ? JSON.parse(event.body) : {};
  } catch {
    return {};
  }
}

function getQueryParams(event) {
  return event.queryStringParameters || {};
}

function getPathParam(event, paramName) {
  // Extract from path like /api/regions/bordeaux
  const path = event.path || '';
  const parts = path.split('/').filter(Boolean);
  
  // Find the param after the function name
  const funcIndex = parts.findIndex(p => p === 'functions' || p === 'api');
  if (funcIndex >= 0 && parts.length > funcIndex + 2) {
    return parts[parts.length - 1];
  }
  
  return event.pathParameters?.[paramName] || null;
}

module.exports = {
  success,
  error,
  setCookie,
  parseBody,
  getQueryParams,
  getPathParam
};
