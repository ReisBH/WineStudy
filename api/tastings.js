const { handleNetlifyFunction } = require('./_netlify');
const { handler } = require('../netlify/functions/tastings');

module.exports = (req, res) => handleNetlifyFunction(req, res, handler);
