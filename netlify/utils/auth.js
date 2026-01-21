const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'winestudy-secret-key-change-in-production';
const JWT_EXPIRATION = '7d';

function generateToken(userId, email) {
  return jwt.sign(
    { user_id: userId, email: email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function getTokenFromHeaders(headers) {
  const authHeader = headers.authorization || headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check for cookie
  const cookies = headers.cookie;
  if (cookies) {
    const match = cookies.match(/auth_token=([^;]+)/);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

function getUserFromRequest(event) {
  const token = getTokenFromHeaders(event.headers);
  if (!token) return null;
  return verifyToken(token);
}

module.exports = {
  generateToken,
  verifyToken,
  getTokenFromHeaders,
  getUserFromRequest,
  JWT_SECRET
};
