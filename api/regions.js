const { handleNetlifyFunction } = require('./_netlify');
const { handler } = require('../netlify/functions/regions');

module.exports = (req, res) => handleNetlifyFunction(req, res, handler);
