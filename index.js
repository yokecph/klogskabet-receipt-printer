// Set up the printer
const printer = require('./lib/printer.js');

printer.on('ready', function () {
  // console.log('ready');
});

printer.on('error', function (err) {
  console.error('ERROR', err);
});

printer.init();

// set up the button
const Button = require('./lib/button.js');
const printButton = new Button(17);

printButton.on('press', function () {
  printer.print();
});
