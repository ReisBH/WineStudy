const { pool } = require('./utils/db');
const { getUserFromRequest } = require('./utils/auth');
const { success, error, parseBody } = require('./utils/response');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return success({});
  }

  try {
    const path = event.path;
    const pathParts = path.split('/').filter(Boolean);
    
    // Find 'lessons' in path
    const lessonsIndex = pathParts.findIndex(p => p === 'lessons');
    
    if (lessonsIndex < 0) {
      return error('Invalid path', 400);
    }

    const lessonId = pathParts[lessonsIndex + 1];

    // GET /api/study/lessons/{lesson_id}
    if (event.httpMethod === 'GET') {
      const result = await pool.query(
        `SELECT lesson_id, track_id, title_pt, title_en,
                content_pt, content_en, order_index, duration_minutes
         FROM lessons
         WHERE lesson_id = $1`,
        [lessonId]
      );

      if (result.rows.length === 0) {
        return error('Lesson not found', 404);
      }

      return success(result.rows[0]);
    }

    // POST /api/study/lessons/{lesson_id}/complete
    if (event.httpMethod === 'POST' && pathParts.includes('complete')) {
      const userData = getUserFromRequest(event);
      
      if (!userData) {
        return error('Not authenticated', 401);
      }

      // Check if lesson exists
      const lessonResult = await pool.query(
        'SELECT lesson_id FROM lessons WHERE lesson_id = $1',
        [lessonId]
      );

      if (lessonResult.rows.length === 0) {
        return error('Lesson not found', 404);
      }

      // Update user progress
      await pool.query(
        `INSERT INTO user_progress (user_id, completed_lessons, last_activity_date)
         VALUES ($1, ARRAY[$2], CURRENT_DATE)
         ON CONFLICT (user_id) DO UPDATE
         SET completed_lessons = 
           CASE 
             WHEN $2 = ANY(user_progress.completed_lessons) THEN user_progress.completed_lessons
             ELSE array_append(user_progress.completed_lessons, $2)
           END,
           last_activity_date = CURRENT_DATE`,
        [userData.user_id, lessonId]
      );

      return success({ message: 'Lesson marked as complete', lesson_id: lessonId });
    }

    return error('Method not allowed', 405);
  } catch (err) {
    console.error('Lessons error:', err);
    return error('Internal server error', 500);
  }
};
