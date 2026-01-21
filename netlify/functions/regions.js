const { pool } = require('./utils/db');
const { success, error, getQueryParams } = require('./utils/response');

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
    const lastPart = pathParts[pathParts.length - 1];
    
    // If the last part is not 'regions', it's a specific region ID
    if (lastPart && lastPart !== 'regions') {
      const regionId = lastPart;
      
      const result = await pool.query(
        `SELECT region_id, country_id, name, name_pt, name_en, 
                description_pt, description_en, terroir, climate,
                appellations, main_grapes, key_grapes, wine_styles
         FROM regions WHERE region_id = $1`,
        [regionId]
      );

      if (result.rows.length === 0) {
        return error('Region not found', 404);
      }

      return success(result.rows[0]);
    }

    // Get all regions, optionally filtered by country
    const { country_id } = getQueryParams(event);
    
    let query = `SELECT region_id, country_id, name, name_pt, name_en, 
                        description_pt, description_en, terroir, climate,
                        appellations, main_grapes, key_grapes, wine_styles
                 FROM regions`;
    const params = [];

    if (country_id) {
      query += ' WHERE country_id = $1';
      params.push(country_id);
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);

    return success(result.rows);
  } catch (err) {
    console.error('Regions error:', err);
    return error('Internal server error', 500);
  }
};
