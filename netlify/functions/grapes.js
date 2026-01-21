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
    
    // If the last part is not 'grapes', it's a specific grape ID
    if (lastPart && lastPart !== 'grapes') {
      const grapeId = lastPart;
      
      const result = await pool.query(
        `SELECT grape_id, name, grape_type, origin_country,
                description_pt, description_en,
                aroma_notes_pt, aroma_notes_en,
                flavor_notes_pt, flavor_notes_en,
                structure, aging_potential, best_regions,
                climate_preference, image_url
         FROM grapes WHERE grape_id = $1`,
        [grapeId]
      );

      if (result.rows.length === 0) {
        return error('Grape not found', 404);
      }

      const grape = result.rows[0];
      // Format response to match existing API
      return success({
        ...grape,
        aromatic_notes: grape.aroma_notes_pt || [],
        flavor_notes: grape.flavor_notes_pt || []
      });
    }

    // Get all grapes, optionally filtered
    const { grape_type, aroma } = getQueryParams(event);
    
    let query = `SELECT grape_id, name, grape_type, origin_country,
                        description_pt, description_en,
                        aroma_notes_pt, aroma_notes_en,
                        flavor_notes_pt, flavor_notes_en,
                        structure, aging_potential, best_regions,
                        climate_preference, image_url
                 FROM grapes WHERE 1=1`;
    const params = [];
    let paramCount = 0;

    if (grape_type) {
      paramCount++;
      query += ` AND grape_type = $${paramCount}`;
      params.push(grape_type);
    }

    if (aroma) {
      paramCount++;
      query += ` AND ($${paramCount} = ANY(aroma_notes_pt) OR $${paramCount} = ANY(aroma_notes_en))`;
      params.push(aroma);
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);

    // Format response
    const grapes = result.rows.map(grape => ({
      ...grape,
      aromatic_notes: grape.aroma_notes_pt || [],
      flavor_notes: grape.flavor_notes_pt || []
    }));

    return success(grapes);
  } catch (err) {
    console.error('Grapes error:', err);
    return error('Internal server error', 500);
  }
};
