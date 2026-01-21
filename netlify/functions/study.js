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
    const path = event.path;
    const pathParts = path.split('/').filter(Boolean);
    
    // Find 'tracks' in path to determine context
    const tracksIndex = pathParts.findIndex(p => p === 'tracks');
    
    // /api/study/tracks - List all tracks
    if (tracksIndex >= 0 && pathParts.length === tracksIndex + 1) {
      const result = await pool.query(
        `SELECT track_id, level, title_pt, title_en, 
                description_pt, description_en, lessons_count, image_url
         FROM study_tracks
         ORDER BY CASE level 
           WHEN 'basic' THEN 1 
           WHEN 'intermediate' THEN 2 
           WHEN 'advanced' THEN 3 
         END`
      );

      return success(result.rows);
    }

    // /api/study/tracks/{track_id} or /api/study/tracks/{track_id}/lessons
    if (tracksIndex >= 0 && pathParts.length > tracksIndex + 1) {
      const trackId = pathParts[tracksIndex + 1];
      
      // /api/study/tracks/{track_id}/lessons
      if (pathParts.length > tracksIndex + 2 && pathParts[tracksIndex + 2] === 'lessons') {
        const result = await pool.query(
          `SELECT lesson_id, track_id, title_pt, title_en,
                  content_pt, content_en, order_index, duration_minutes
           FROM lessons
           WHERE track_id = $1
           ORDER BY order_index`,
          [trackId]
        );

        return success(result.rows);
      }

      // /api/study/tracks/{track_id}
      const result = await pool.query(
        `SELECT track_id, level, title_pt, title_en, 
                description_pt, description_en, lessons_count, image_url
         FROM study_tracks
         WHERE track_id = $1`,
        [trackId]
      );

      if (result.rows.length === 0) {
        return error('Track not found', 404);
      }

      return success(result.rows[0]);
    }

    return error('Invalid path', 400);
  } catch (err) {
    console.error('Study error:', err);
    return error('Internal server error', 500);
  }
};
