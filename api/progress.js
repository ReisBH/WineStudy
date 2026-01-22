const { handleNetlifyFunction } = require('./_netlify');
const { handler } = require('../netlify/functions/progress');

module.exports = (req, res) => handleNetlifyFunction(req, res, handler);
