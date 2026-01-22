const { handleNetlifyFunction } = require('../_netlify');
const { handler } = require('../../netlify/functions/auth-login');

module.exports = (req, res) => handleNetlifyFunction(req, res, handler);
