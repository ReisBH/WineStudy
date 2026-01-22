const { handleNetlifyFunction } = require('./_netlify');
const { handler } = require('../netlify/functions/quiz');

module.exports = (req, res) => handleNetlifyFunction(req, res, handler);
