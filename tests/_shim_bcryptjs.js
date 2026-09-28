// TEST-ONLY SHIM: minimal stand-in for `bcryptjs`, using Node's built-in
// crypto.scryptSync instead of a real bcrypt implementation. Not
// cryptographically equivalent to bcrypt, but hashSync/compareSync behave
// correctly and consistently for the app's login/register flow, which is
// all that's needed to exercise the real server code under test.
const crypto = require('crypto');

function hashSync(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 32).toString('hex');
  return `shim$${salt}$${hash}`;
}

function compareSync(password, stored) {
  if (typeof stored !== 'string' || !stored.startsWith('shim$')) return false;
  const [, salt, hash] = stored.split('$');
  const check = crypto.scryptSync(String(password), salt, 32).toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(check, 'hex'));
  } catch (e) {
    return false;
  }
}

module.exports = { hashSync, compareSync };
