const { pool } = require('./utils/db');
const { getUserFromRequest } = require('./utils/auth');
const { success, error } = require('./utils/response');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return success({});
  }

  if (event.httpMethod !== 'GET') {
    return error('Method not allowed', 405);
  }

  try {
    const userData = getUserFromRequest(event);
    
    if (!userData) {
      return error('Not authenticated', 401);
    }

    const result = await pool.query(
      `SELECT user_id, email, name, picture, preferred_language, created_at
       FROM users WHERE user_id = $1`,
      [userData.user_id]
    );

    if (result.rows.length === 0) {
      return error('User not found', 404);
    }

    return success(result.rows[0]);
  } catch (err) {
    console.error('Auth me error:', err);
    return error('Internal server error', 500);
  }
};
