const bcrypt = require('bcryptjs');
const { pool } = require('./utils/db');
const { generateToken } = require('./utils/auth');
const { success, error, parseBody, setCookie } = require('./utils/response');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return success({});
  }

  if (event.httpMethod !== 'POST') {
    return error('Method not allowed', 405);
  }

  try {
    const { email, password } = parseBody(event);

    if (!email || !password) {
      return error('Email and password are required', 400);
    }

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return error('Invalid credentials', 401);
    }

    const user = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return error('Invalid credentials', 401);
    }

    const token = generateToken(user.user_id, user.email);

    let response = success({
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      preferred_language: user.preferred_language,
      created_at: user.created_at,
      token
    });

    return setCookie(response, 'auth_token', token);
  } catch (err) {
    console.error('Login error:', err);
    return error('Internal server error', 500);
  }
};
