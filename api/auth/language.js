const { handleNetlifyFunction } = require('../_netlify');
const { handler } = require('../../netlify/functions/auth-language');

module.exports = (req, res) => handleNetlifyFunction(req, res, handler);
