const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('backend critical files exist', () => {
  const root = path.resolve(__dirname, '..');
  assert.equal(fs.existsSync(path.join(root, 'src', 'server.js')), true);
  assert.equal(fs.existsSync(path.join(root, 'src', 'routes', 'auth.js')), true);
  assert.equal(fs.existsSync(path.join(root, 'src', 'routes', 'shops.js')), true);
  assert.equal(fs.existsSync(path.join(root, 'src', 'routes', 'orders.js')), true);
});
