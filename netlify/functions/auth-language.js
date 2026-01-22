const { pool } = require('./utils/db');
const { getUserFromRequest } = require('./utils/auth');
const { success, error, parseBody } = require('./utils/response');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return success({});
  }

  if (event.httpMethod !== 'PUT') {
    return error('Method not allowed', 405);
  }

  const userData = getUserFromRequest(event);
  if (!userData) {
    return error('Not authenticated', 401);
  }

  try {
    const body = parseBody(event);
    const language = body.language || 'pt';

    if (!['pt', 'en'].includes(language)) {
      return error('Invalid language', 400);
    }

    const result = await pool.query(
      'UPDATE users SET preferred_language = $1 WHERE user_id = $2 RETURNING preferred_language',
      [language, userData.user_id]
    );

    if (result.rows.length === 0) {
      return error('User not found', 404);
    }

    return success({ message: 'Language updated', language: result.rows[0].preferred_language });
  } catch (err) {
    console.error('Language update error:', err);
    return error('Internal server error', 500);
  }
};
