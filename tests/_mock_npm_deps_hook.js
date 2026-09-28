// TEST-ONLY HOOK: redirects require('express'), require('cors') and
// require('bcryptjs') to hand-written local shims (see _shim_*.js in this
// folder), for environments with no npm registry access / no node_modules.
// Loaded via `node -r`, same technique as _mock_mongodb_hook.js.
const Module = require('module');
const path = require('path');

const SHIMS = {
  express: path.join(__dirname, '_shim_express.js'),
  cors: path.join(__dirname, '_shim_cors.js'),
  bcryptjs: path.join(__dirname, '_shim_bcryptjs.js')
};

const originalLoad = Module._load;
Module._load = function (request, ...rest) {
  if (Object.prototype.hasOwnProperty.call(SHIMS, request)) {
    return originalLoad.call(this, SHIMS[request], ...rest);
  }
  return originalLoad.call(this, request, ...rest);
};
