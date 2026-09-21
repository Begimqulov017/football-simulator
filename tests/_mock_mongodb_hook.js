// ---------------------------------------------------------------------------
// TEST-ONLY HOOK: redirects require('mongodb') to an in-memory fake driver,
// WITHOUT touching server/node_modules (so the real driver used in
// production/Render is never modified). Loaded via `node -r`.
//
// Sabab (loyiha eslatmasidan): "MongoDB'ga bu ishlash muhitidan internet
// orqali ulanib bo'lmaydi ... require('mongodb')ni fake/mock versiya bilan
// almashtirish kerak bo'lishi mumkin (Module.prototype.require orqali
// intercept qilish ishlaydi)."
// ---------------------------------------------------------------------------
const Module = require('module');
const store = new Map();

class FakeCollection {
  async findOne(query) {
    const doc = store.get(query._id);
    return doc ? JSON.parse(JSON.stringify(doc)) : null;
  }
  async insertOne(doc) {
    store.set(doc._id, JSON.parse(JSON.stringify(doc)));
    return { acknowledged: true };
  }
  async replaceOne(query, doc) {
    store.set(query._id, JSON.parse(JSON.stringify(doc)));
    return { acknowledged: true };
  }
}
class FakeDb {
  collection() { return new FakeCollection(); }
}
class MongoClient {
  constructor(uri) { this.uri = uri; }
  async connect() { return this; }
  db() { return new FakeDb(); }
}
const fakeMongo = { MongoClient };

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request === 'mongodb') return 'mongodb'; // short-circuit, handled below
  return originalResolve.call(this, request, ...rest);
};
const originalLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === 'mongodb') return fakeMongo;
  return originalLoad.call(this, request, ...rest);
};
