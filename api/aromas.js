const { handleNetlifyFunction } = require('./_netlify');
const { handler } = require('../netlify/functions/aromas');

module.exports = (req, res) => handleNetlifyFunction(req, res, handler);
