// A very simple module for keeping track of receipt sequence numbers.
// The count is stored on disk when set or incremented

// the default/fallback state
const data = { count: 1 };

// path to save data
const savePath = __dirname + '/../tmp/counter.js';

// (attempt to) load existing data
function load() {
  try {
    data.count = require(savePath).count || data.count || 1;
  } catch(e) {
    // no-op
  }
}

// load immediately
load();

// write data to disk
function save() {
  const json = `module.exports = ${JSON.stringify(data)};`;
  require('fs').writeFileSync(savePath, json);
}

// expose API
module.exports = {
  // get current count
  getCount: _ => data.count,

  // increment count by 1
  increment: _ => {
    ++data.count
    save();
  },

  // set count to the given number
  set: n => {
    data.count = Number(n);
    save();
  }
};

