const { pool } = require('./utils/db');
const { success, error, getPathParam } = require('./utils/response');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return success({});
  }

  if (event.httpMethod !== 'GET') {
    return error('Method not allowed', 405);
  }

  try {
    // Check if requesting specific country
    const path = event.path;
    const pathParts = path.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    
    // If the last part is not 'countries', it's a specific country ID
    if (lastPart && lastPart !== 'countries') {
      const countryId = lastPart;
      
      const result = await pool.query(
        `SELECT country_id, name_pt, name_en, world_type, flag_emoji, 
                description_pt, description_en, image_url
         FROM countries WHERE country_id = $1`,
        [countryId]
      );

      if (result.rows.length === 0) {
        return error('Country not found', 404);
      }

      return success(result.rows[0]);
    }

    // Get all countries
    const result = await pool.query(
      `SELECT country_id, name_pt, name_en, world_type, flag_emoji, 
              description_pt, description_en, image_url
       FROM countries ORDER BY name_en`
    );

    return success(result.rows);
  } catch (err) {
    console.error('Countries error:', err);
    return error('Internal server error', 500);
  }
};
