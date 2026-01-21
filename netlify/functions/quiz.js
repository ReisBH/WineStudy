const { pool } = require('../utils/db');
const { getUserFromRequest } = require('../utils/auth');
const { success, error, parseBody, getQueryParams } = require('../utils/response');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return success({});
  }

  try {
    const path = event.path;
    const pathParts = path.split('/').filter(Boolean);
    
    // GET /api/quiz/tracks/{track_id}/questions
    if (event.httpMethod === 'GET') {
      const tracksIndex = pathParts.findIndex(p => p === 'tracks');
      
      if (tracksIndex >= 0 && pathParts.length > tracksIndex + 2) {
        const trackId = pathParts[tracksIndex + 1];
        const { limit = 5 } = getQueryParams(event);

        const result = await pool.query(
          `SELECT question_id, track_id, question_pt, question_en,
                  options_pt, options_en, correct_answer,
                  explanation_pt, explanation_en
           FROM quiz_questions
           WHERE track_id = $1
           ORDER BY RANDOM()
           LIMIT $2`,
          [trackId, parseInt(limit)]
        );

        return success(result.rows);
      }
    }

    // POST /api/quiz/submit
    if (event.httpMethod === 'POST' && pathParts.includes('submit')) {
      const userData = getUserFromRequest(event);
      const body = parseBody(event);
      
      const { question_id, selected_answer } = body;

      if (!question_id || selected_answer === undefined) {
        return error('question_id and selected_answer are required', 400);
      }

      // Get question
      const result = await pool.query(
        `SELECT correct_answer, explanation_pt, explanation_en, track_id
         FROM quiz_questions
         WHERE question_id = $1`,
        [question_id]
      );

      if (result.rows.length === 0) {
        return error('Question not found', 404);
      }

      const question = result.rows[0];
      const isCorrect = question.correct_answer === selected_answer;

      // Update user progress if authenticated
      if (userData && isCorrect) {
        await pool.query(
          `UPDATE user_progress 
           SET quiz_scores = jsonb_set(
             COALESCE(quiz_scores, '{}'::jsonb),
             ARRAY[$2],
             to_jsonb(COALESCE((quiz_scores->>$2)::int, 0) + 1)
           ),
           last_activity_date = CURRENT_DATE
           WHERE user_id = $1`,
          [userData.user_id, question.track_id]
        );
      }

      return success({
        correct: isCorrect,
        correct_answer: question.correct_answer,
        explanation_pt: question.explanation_pt,
        explanation_en: question.explanation_en
      });
    }

    return error('Invalid path or method', 400);
  } catch (err) {
    console.error('Quiz error:', err);
    return error('Internal server error', 500);
  }
};
