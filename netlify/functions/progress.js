const { pool } = require('../utils/db');
const { getUserFromRequest } = require('../utils/auth');
const { success, error } = require('../utils/response');

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
      `SELECT user_id, completed_lessons, quiz_scores, badges,
              total_tastings, current_streak, last_activity_date
       FROM user_progress
       WHERE user_id = $1`,
      [userData.user_id]
    );

    if (result.rows.length === 0) {
      // Return default progress
      return success({
        user_id: userData.user_id,
        completed_lessons: [],
        quiz_scores: {},
        badges: [],
        total_tastings: 0,
        current_streak: 0
      });
    }

    return success(result.rows[0]);
  } catch (err) {
    console.error('Progress error:', err);
    return error('Internal server error', 500);
  }
};
