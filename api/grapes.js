const { handleNetlifyFunction } = require('./_netlify');
const { handler } = require('../netlify/functions/grapes');

module.exports = (req, res) => handleNetlifyFunction(req, res, handler);
