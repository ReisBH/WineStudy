const { pool } = require('../utils/db');
const { success, error } = require('../utils/response');

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
    
    // Check if we're looking for grapes with a specific aroma
    // Path: /api/aromas/{tag_id}/grapes
    const aromasIndex = pathParts.findIndex(p => p === 'aromas');
    
    if (aromasIndex >= 0 && pathParts.length > aromasIndex + 2 && pathParts[aromasIndex + 2] === 'grapes') {
      const tagId = pathParts[aromasIndex + 1];
      
      // Get grapes that have this aroma
      const result = await pool.query(
        `SELECT grape_id, name, grape_type, origin_country,
                description_pt, description_en,
                aroma_notes_pt, aroma_notes_en,
                flavor_notes_pt, flavor_notes_en,
                structure, aging_potential, best_regions,
                climate_preference, image_url
         FROM grapes
         WHERE $1 = ANY(aroma_notes_pt) OR $1 = ANY(aroma_notes_en)
         ORDER BY name`,
        [tagId]
      );

      const grapes = result.rows.map(grape => ({
        ...grape,
        aromatic_notes: grape.aroma_notes_pt || [],
        flavor_notes: grape.flavor_notes_pt || []
      }));

      return success(grapes);
    }

    // Get all aroma tags
    const result = await pool.query(
      `SELECT tag_id, name_pt, name_en, category, emoji
       FROM aroma_tags ORDER BY category, name_en`
    );

    return success(result.rows);
  } catch (err) {
    console.error('Aromas error:', err);
    return error('Internal server error', 500);
  }
};
