// set up the LED
const Led = require('./lib/led.js');
const statusLed = new Led(26);

statusLed.on();

// ===================================

// Set up the printer
const printer = require('./lib/printer.js');

printer.on('ready', function () {
  statusLed.off();
});

printer.on('printing', function () {
  statusLed.on();
});

printer.on('error', function (err) {
  console.error('ERROR', err);
});

printer.init();

// ===================================

// set up the button
const Button = require('./lib/button.js');
const printButton = new Button(17);

printButton.on('press', function () {
  printer.print();
});

