const { handleNetlifyFunction } = require('./_netlify');
const { handler } = require('../netlify/functions/seed');

module.exports = (req, res) => handleNetlifyFunction(req, res, handler);
