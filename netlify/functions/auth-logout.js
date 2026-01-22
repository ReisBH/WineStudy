const { success, error, setCookie } = require('./utils/response');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return success({});
  }

  if (event.httpMethod !== 'POST') {
    return error('Method not allowed', 405);
  }

  const response = success({ message: 'Logged out successfully' });
  return setCookie(response, 'auth_token', '', { maxAge: 0 });
};
