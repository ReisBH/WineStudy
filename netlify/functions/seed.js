const { pool } = require('../utils/db');
const { success, error } = require('../utils/response');

// Seed data
const COUNTRIES = [
  { country_id: 'france', name_pt: 'França', name_en: 'France', world_type: 'old_world', flag_emoji: '🇫🇷', description_pt: 'O berço dos vinhos finos', description_en: 'The birthplace of fine wines' },
  { country_id: 'italy', name_pt: 'Itália', name_en: 'Italy', world_type: 'old_world', flag_emoji: '🇮🇹', description_pt: 'Tradição milenar em vinhos', description_en: 'Millennial wine tradition' },
  { country_id: 'spain', name_pt: 'Espanha', name_en: 'Spain', world_type: 'old_world', flag_emoji: '🇪🇸', description_pt: 'Maior área vinícola do mundo', description_en: 'Largest wine region in the world' },
  { country_id: 'portugal', name_pt: 'Portugal', name_en: 'Portugal', world_type: 'old_world', flag_emoji: '🇵🇹', description_pt: 'Casa do vinho do Porto', description_en: 'Home of Port wine' },
  { country_id: 'germany', name_pt: 'Alemanha', name_en: 'Germany', world_type: 'old_world', flag_emoji: '🇩🇪', description_pt: 'Mestre em Riesling', description_en: 'Master of Riesling' },
  { country_id: 'usa', name_pt: 'Estados Unidos', name_en: 'United States', world_type: 'new_world', flag_emoji: '🇺🇸', description_pt: 'Líder do Novo Mundo', description_en: 'New World leader' },
  { country_id: 'argentina', name_pt: 'Argentina', name_en: 'Argentina', world_type: 'new_world', flag_emoji: '🇦🇷', description_pt: 'Terra do Malbec', description_en: 'Land of Malbec' },
  { country_id: 'chile', name_pt: 'Chile', name_en: 'Chile', world_type: 'new_world', flag_emoji: '🇨🇱', description_pt: 'Vinhos de altitude', description_en: 'High altitude wines' },
  { country_id: 'australia', name_pt: 'Austrália', name_en: 'Australia', world_type: 'new_world', flag_emoji: '🇦🇺', description_pt: 'Inovação e qualidade', description_en: 'Innovation and quality' },
  { country_id: 'new_zealand', name_pt: 'Nova Zelândia', name_en: 'New Zealand', world_type: 'new_world', flag_emoji: '🇳🇿', description_pt: 'Sauvignon Blanc excepcional', description_en: 'Exceptional Sauvignon Blanc' },
  { country_id: 'south_africa', name_pt: 'África do Sul', name_en: 'South Africa', world_type: 'new_world', flag_emoji: '🇿🇦', description_pt: 'Berço do Pinotage', description_en: 'Birthplace of Pinotage' },
  { country_id: 'austria', name_pt: 'Áustria', name_en: 'Austria', world_type: 'old_world', flag_emoji: '🇦🇹', description_pt: 'Grüner Veltliner único', description_en: 'Unique Grüner Veltliner' },
  { country_id: 'greece', name_pt: 'Grécia', name_en: 'Greece', world_type: 'old_world', flag_emoji: '🇬🇷', description_pt: 'Origem antiga do vinho', description_en: 'Ancient origin of wine' },
];

const STUDY_TRACKS = [
  { track_id: 'basic', level: 'basic', title_pt: 'Fundamentos do Vinho', title_en: 'Wine Fundamentals', description_pt: 'Aprenda os conceitos básicos', description_en: 'Learn the basic concepts', lessons_count: 5 },
  { track_id: 'intermediate', level: 'intermediate', title_pt: 'Terroir e Regiões', title_en: 'Terroir and Regions', description_pt: 'Explore regiões vinícolas', description_en: 'Explore wine regions', lessons_count: 8 },
  { track_id: 'advanced', level: 'advanced', title_pt: 'Mestria em Vinhos', title_en: 'Wine Mastery', description_pt: 'Conhecimento avançado', description_en: 'Advanced knowledge', lessons_count: 10 },
];

const AROMA_TAGS = [
  { tag_id: 'apple', name_pt: 'Maçã', name_en: 'Apple', category: 'fruit', emoji: '🍎' },
  { tag_id: 'citrus', name_pt: 'Cítrico', name_en: 'Citrus', category: 'fruit', emoji: '🍋' },
  { tag_id: 'berry', name_pt: 'Frutas vermelhas', name_en: 'Berries', category: 'fruit', emoji: '🍓' },
  { tag_id: 'cherry', name_pt: 'Cereja', name_en: 'Cherry', category: 'fruit', emoji: '🍒' },
  { tag_id: 'vanilla', name_pt: 'Baunilha', name_en: 'Vanilla', category: 'oak', emoji: '🍦' },
  { tag_id: 'oak', name_pt: 'Carvalho', name_en: 'Oak', category: 'oak', emoji: '🪵' },
  { tag_id: 'pepper', name_pt: 'Pimenta', name_en: 'Pepper', category: 'spice', emoji: '🌶️' },
  { tag_id: 'floral', name_pt: 'Floral', name_en: 'Floral', category: 'floral', emoji: '🌸' },
  { tag_id: 'mineral', name_pt: 'Mineral', name_en: 'Mineral', category: 'earth', emoji: '🪨' },
  { tag_id: 'tobacco', name_pt: 'Tabaco', name_en: 'Tobacco', category: 'earth', emoji: '🍂' },
];

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return success({});
  }

  if (event.httpMethod !== 'POST') {
    return error('Method not allowed', 405);
  }

  try {
    // Seed countries
    for (const country of COUNTRIES) {
      await pool.query(
        `INSERT INTO countries (country_id, name_pt, name_en, world_type, flag_emoji, description_pt, description_en)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (country_id) DO NOTHING`,
        [country.country_id, country.name_pt, country.name_en, country.world_type, country.flag_emoji, country.description_pt, country.description_en]
      );
    }

    // Seed study tracks
    for (const track of STUDY_TRACKS) {
      await pool.query(
        `INSERT INTO study_tracks (track_id, level, title_pt, title_en, description_pt, description_en, lessons_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (track_id) DO NOTHING`,
        [track.track_id, track.level, track.title_pt, track.title_en, track.description_pt, track.description_en, track.lessons_count]
      );
    }

    // Seed aroma tags
    for (const tag of AROMA_TAGS) {
      await pool.query(
        `INSERT INTO aroma_tags (tag_id, name_pt, name_en, category, emoji)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (tag_id) DO NOTHING`,
        [tag.tag_id, tag.name_pt, tag.name_en, tag.category, tag.emoji]
      );
    }

    return success({ message: 'Database seeded successfully' });
  } catch (err) {
    console.error('Seed error:', err);
    return error('Internal server error: ' + err.message, 500);
  }
};
