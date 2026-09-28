// TEST-ONLY SHIM: a tiny, hand-written subset of Express sufficient to run
// server/index.js unmodified, without needing `npm install` / registry
// access. Implements exactly what server/index.js uses: app.use(mw),
// app.get/post/put/delete(path, ...handlers), route params (:name),
// req.query, req.body (via express.json()), res.status().json().
const http = require('http');
const { URL } = require('url');

function pathToMatcher(path) {
  const paramNames = [];
  const pattern = path
    .split('/')
    .map((seg) => {
      if (seg.startsWith(':')) {
        paramNames.push(seg.slice(1));
        return '([^/]+)';
      }
      return seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  const re = new RegExp(`^${pattern}$`);
  return { re, paramNames };
}

class App {
  constructor() {
    this.middlewares = [];
    this.routes = []; // { method, re, paramNames, handlers }
  }

  use(mw) {
    this.middlewares.push(mw);
  }

  _register(method, path, handlers) {
    const { re, paramNames } = pathToMatcher(path);
    this.routes.push({ method, re, paramNames, handlers });
  }

  get(path, ...handlers) { this._register('GET', path, handlers); }
  post(path, ...handlers) { this._register('POST', path, handlers); }
  put(path, ...handlers) { this._register('PUT', path, handlers); }
  delete(path, ...handlers) { this._register('DELETE', path, handlers); }

  listen(port, cb) {
    const server = http.createServer((req, res) => this._handle(req, res));
    server.listen(port, cb);
    return server;
  }

  _handle(req, res) {
    const u = new URL(req.url, 'http://localhost');
    req.query = Object.fromEntries(u.searchParams.entries());
    req.path = u.pathname;

    res.status = function status(code) { this.statusCode = code; return this; };
    res.json = function json(obj) {
      const body = JSON.stringify(obj);
      this.setHeader('Content-Type', 'application/json');
      this.end(body);
    };

    const match = this.routes.find((r) => r.method === req.method && r.re.test(req.path));
    if (!match) {
      res.statusCode = 404;
      res.json({ ok: false, error: 'not found' });
      return;
    }
    const m = match.re.exec(req.path);
    req.params = {};
    match.paramNames.forEach((name, i) => { req.params[name] = decodeURIComponent(m[i + 1]); });

    const chain = [...this.middlewares, ...match.handlers];
    let idx = 0;
    const next = (err) => {
      if (err) {
        res.statusCode = 500;
        res.json({ ok: false, error: String(err && err.message || err) });
        return;
      }
      const fn = chain[idx];
      idx += 1;
      if (!fn) return; // handler didn't respond - let it hang like real express would misbehave, but shouldn't happen
      fn(req, res, next);
    };
    next();
  }
}

function express() {
  return new App();
}

express.json = function jsonMiddleware() {
  return (req, res, next) => {
    if (req.method === 'GET' || req.method === 'DELETE') { req.body = {}; return next(); }
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      if (!raw) { req.body = {}; return next(); }
      try {
        req.body = JSON.parse(raw);
      } catch (e) {
        req.body = {};
      }
      next();
    });
  };
};

module.exports = express;
