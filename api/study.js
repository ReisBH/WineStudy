const { handleNetlifyFunction } = require('./_netlify');
const { handler } = require('../netlify/functions/study');

module.exports = (req, res) => handleNetlifyFunction(req, res, handler);
