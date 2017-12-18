// Set up the printer
const printer = require('node-thermal-printer');
printer.init({
  // Yes, it's an Epson-brand printer...
  'type': 'epson',

  // The character set doesn't matter *too* much, but for good measure, we set
  // it to DENMARK2, so the base charset includes some æ, ø, å stuff.
  // The differences between the charsets can be seen here:
  // https://reference.epson-biz.com/modules/ref_charcode_en/index.php?content_id=3
  'characterSet': 'DENMARK2',

  // This relies on the printer having been set up in CUPS with this exact name
  'interface': 'printer:EPSON_TM-T20II'
});

const print = (function () {
  var printing = false;

  return function (callback) {
    if (printing) {
      callback('Printer busy'); // TODO: Better errors, pls
      return;
    }

    // Do some layout
    printer.alignCenter();

    // Print something
    printer.println('Hello, world');

    // Print an image
    printer.printImage(__dirname + '/tmp/test.png', (done) => {
      // TODO: What if done is false...?

      // Activate the cutter, but leave the printed slip loosely attached
      printer.partialCut();

      // Execute buffered commands
      printer.execute((err) => {
        printing = false;
        callback(err);
      });
    });
  }
}());

// print((err) => {
//   if (err) {
//     console.error('Print failed:', err);
//   } else {
//     console.log('Print done');
//   }
// });

const Button = require('./lib/button.js');

const printButton = new Button(17);

printButton.on('press', print);
