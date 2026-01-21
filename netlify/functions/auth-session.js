const { v4: uuidv4 } = require('uuid');
const { pool } = require('../utils/db');
const { generateToken } = require('../utils/auth');
const { success, error, parseBody, setCookie } = require('../utils/response');

// Google OAuth session handling
exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return success({});
  }

  if (event.httpMethod !== 'POST') {
    return error('Method not allowed', 405);
  }

  try {
    const { code } = parseBody(event);

    if (!code) {
      return error('Authorization code is required', 400);
    }

    // Exchange code for tokens with Google
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Google token error:', errorData);
      return error('Failed to exchange authorization code', 400);
    }

    const tokens = await tokenResponse.json();

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });

    if (!userResponse.ok) {
      return error('Failed to get user info from Google', 400);
    }

    const googleUser = await userResponse.json();

    // Check if user exists
    let result = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR google_id = $2',
      [googleUser.email, googleUser.id]
    );

    let user;
    let isNewUser = false;

    if (result.rows.length === 0) {
      // Create new user
      const userId = `user_${uuidv4().substring(0, 12)}`;
      
      const insertResult = await pool.query(
        `INSERT INTO users (user_id, email, name, picture, google_id, preferred_language, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING user_id, email, name, picture, preferred_language, created_at`,
        [userId, googleUser.email, googleUser.name, googleUser.picture, googleUser.id, 'pt']
      );

      // Create user progress
      await pool.query(
        `INSERT INTO user_progress (user_id, completed_lessons, quiz_scores, badges, total_tastings, current_streak)
         VALUES ($1, '{}', '{}', '{}', 0, 0)`,
        [userId]
      );

      user = insertResult.rows[0];
      isNewUser = true;
    } else {
      user = result.rows[0];
      
      // Update picture if changed
      if (googleUser.picture && googleUser.picture !== user.picture) {
        await pool.query(
          'UPDATE users SET picture = $1 WHERE user_id = $2',
          [googleUser.picture, user.user_id]
        );
        user.picture = googleUser.picture;
      }
    }

    const token = generateToken(user.user_id, user.email);

    let response = success({
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      preferred_language: user.preferred_language,
      created_at: user.created_at,
      is_new_user: isNewUser,
      token
    });

    return setCookie(response, 'auth_token', token);
  } catch (err) {
    console.error('Google session error:', err);
    return error('Internal server error', 500);
  }
};
