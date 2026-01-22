const { handleNetlifyFunction } = require('./_netlify');
const { handler } = require('../netlify/functions/countries');

module.exports = (req, res) => handleNetlifyFunction(req, res, handler);
