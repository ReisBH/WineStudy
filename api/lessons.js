const { handleNetlifyFunction } = require('./_netlify');
const { handler } = require('../netlify/functions/lessons');

module.exports = (req, res) => handleNetlifyFunction(req, res, handler);
