const data = { count: 1 };

const savePath = __dirname + '/../tmp/counter.js';

function load() {
  try {
    data.count = require(savePath).count || data.count || 1;
  } catch(e) {
    // no-op
  }
}

// load immediately
load();

function save() {
  const json = `module.exports = ${JSON.stringify(data)};`;
  require('fs').writeFileSync(savePath, json);
}

module.exports = {
  getCount: _ => data.count,

  increment: _ => {
    ++data.count
    save();
  },

  set: n => {
    data.count = Number(n);
    save();
  }
};

