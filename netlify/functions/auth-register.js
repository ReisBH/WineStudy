const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../utils/db');
const { generateToken } = require('../utils/auth');
const { success, error, parseBody, setCookie } = require('../utils/response');

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return success({});
  }

  if (event.httpMethod !== 'POST') {
    return error('Method not allowed', 405);
  }

  try {
    const { email, password, name } = parseBody(event);

    if (!email || !password || !name) {
      return error('Email, password and name are required', 400);
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return error('Email already registered', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `user_${uuidv4().substring(0, 12)}`;

    // Create user
    const result = await pool.query(
      `INSERT INTO users (user_id, email, password_hash, name, preferred_language, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING user_id, email, name, picture, preferred_language, created_at`,
      [userId, email.toLowerCase(), passwordHash, name, 'pt']
    );

    // Create user progress
    await pool.query(
      `INSERT INTO user_progress (user_id, completed_lessons, quiz_scores, badges, total_tastings, current_streak)
       VALUES ($1, '{}', '{}', '{}', 0, 0)`,
      [userId]
    );

    const user = result.rows[0];
    const token = generateToken(userId, email);

    let response = success({
      ...user,
      token
    }, 201);

    return setCookie(response, 'auth_token', token);
  } catch (err) {
    console.error('Register error:', err);
    return error('Internal server error', 500);
  }
};
