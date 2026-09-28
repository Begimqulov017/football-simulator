// TEST-ONLY SHIM: minimal stand-in for the `cors` package. server/index.js
// only calls cors() with no options, so a permissive default is enough.
module.exports = function cors() {
  return (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
    next();
  };
};
