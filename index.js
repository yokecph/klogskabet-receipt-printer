// whether or not to respond to button presses
var canPrint = false;

// set up the LED
const Led = require('./lib/led.js');
const statusLed = new Led(26);

statusLed.blink();
process.on('exit', _ => statusLed.off());

// ===================================

// Ensure graphic exists and do any necessary conversions
(function () {
  const execSync = require('child_process').execSync;

  const cmd = [
    'convert',                            // imagemagick's convert
    `'${__dirname + '/receipt.png'}'`,    // input file
    '-resize "550>"',                     // scale image if wider than 550px
    '-rotate 180',                        // rotate so it comes out of the printer right-side-up
    '-background white',                  // add a white background
    '-alpha remove',                      // remove alpha channel
    `'${__dirname + '/tmp/graphic.png'}'` // output file
  ].join(' ');

  execSync(cmd)
}());

// ===================================

// Set up the printer
const printer = require('./lib/printer.js');

printer.on('ready', function () {
  statusLed.blink();

  setTimeout(_ => {
    statusLed.on();
    canPrint = true;
  }, 3000);
});

printer.on('printing', function () {
  // ...
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
  console.log(printer.activeJobCount);
  if (!canPrint) return;
  canPrint = false;
  printer.print();
});

