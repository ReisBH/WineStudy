const { v4: uuidv4 } = require('uuid');
const { pool } = require('../utils/db');
const { getUserFromRequest } = require('../utils/auth');
const { success, error, parseBody } = require('../utils/response');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return success({});
  }

  const path = event.path;
  const pathParts = path.split('/').filter(Boolean);
  const lastPart = pathParts[pathParts.length - 1];
  
  // Check if this is a specific tasting request
  const isSpecificTasting = lastPart && lastPart !== 'tastings' && !lastPart.startsWith('tasting');

  try {
    const userData = getUserFromRequest(event);
    
    if (!userData) {
      return error('Not authenticated', 401);
    }

    // GET /api/tastings - List all tastings for user
    if (event.httpMethod === 'GET' && !isSpecificTasting) {
      const result = await pool.query(
        `SELECT tasting_id, user_id, wine_name, producer, vintage, region,
                grape_ids, region_id, appearance, nose, palate, conclusion,
                notes, created_at
         FROM tasting_notes
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userData.user_id]
      );

      return success(result.rows);
    }

    // GET /api/tastings/{tasting_id} - Get specific tasting
    if (event.httpMethod === 'GET' && isSpecificTasting) {
      const tastingId = lastPart;
      
      const result = await pool.query(
        `SELECT tasting_id, user_id, wine_name, producer, vintage, region,
                grape_ids, region_id, appearance, nose, palate, conclusion,
                notes, created_at
         FROM tasting_notes
         WHERE tasting_id = $1 AND user_id = $2`,
        [tastingId, userData.user_id]
      );

      if (result.rows.length === 0) {
        return error('Tasting not found', 404);
      }

      return success(result.rows[0]);
    }

    // POST /api/tastings - Create new tasting
    if (event.httpMethod === 'POST') {
      const body = parseBody(event);
      const tastingId = `tasting_${uuidv4().substring(0, 12)}`;

      const result = await pool.query(
        `INSERT INTO tasting_notes 
         (tasting_id, user_id, wine_name, producer, vintage, region,
          grape_ids, region_id, appearance, nose, palate, conclusion,
          notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
         RETURNING *`,
        [
          tastingId,
          userData.user_id,
          body.wine_name,
          body.producer || null,
          body.vintage || null,
          body.region || null,
          body.grape_ids || [],
          body.region_id || null,
          JSON.stringify(body.appearance || {}),
          JSON.stringify(body.nose || {}),
          JSON.stringify(body.palate || {}),
          JSON.stringify(body.conclusion || {}),
          body.notes || null
        ]
      );

      // Update user progress
      await pool.query(
        `UPDATE user_progress 
         SET total_tastings = total_tastings + 1,
             last_activity_date = CURRENT_DATE
         WHERE user_id = $1`,
        [userData.user_id]
      );

      return success(result.rows[0], 201);
    }

    // DELETE /api/tastings/{tasting_id}
    if (event.httpMethod === 'DELETE' && isSpecificTasting) {
      const tastingId = lastPart;
      
      const result = await pool.query(
        `DELETE FROM tasting_notes
         WHERE tasting_id = $1 AND user_id = $2
         RETURNING tasting_id`,
        [tastingId, userData.user_id]
      );

      if (result.rowCount === 0) {
        return error('Tasting not found or not authorized', 404);
      }

      // Update user progress
      await pool.query(
        `UPDATE user_progress 
         SET total_tastings = GREATEST(total_tastings - 1, 0)
         WHERE user_id = $1`,
        [userData.user_id]
      );

      return success({ message: 'Tasting deleted' });
    }

    return error('Method not allowed', 405);
  } catch (err) {
    console.error('Tastings error:', err);
    return error('Internal server error', 500);
  }
};
