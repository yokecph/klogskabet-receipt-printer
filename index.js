/*
  Klogskabet Receipt Printer
  Copyright (C) 2017, 2018  YOKE ApS

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// whether or not to respond to button presses
var canPrint = false;

// set up the LED
const Led = require('./lib/led.js');
const statusLed = new Led(26); // GPIO26 => pin #37

// blink the LED while starting up
statusLed.blink();

// turn off the LED on exit
process.on('exit', _ => statusLed.off());

// ===================================

// Ensure graphic exists and do any necessary conversions
// (intentionally kept synchronous/blocking so the image can be prepared
// before printer is init'ed)
(function () {
  const fs = require('fs');
  const execSync = require('child_process').execSync;

  if (fs.existsSync(`${__dirname + '/tmp/graphic.png'}`)) {
    fs.unlinkSync(`${__dirname + '/tmp/graphic.png'}`);
  }

  const cmd = [
    'convert',                            // imagemagick's convert
    `'${__dirname + '/receipt.png'}'`,    // input file
    '-resize "550>"',                     // scale image if wider than 550px
    '-rotate 180',                        // rotate so it comes out of the printer right-side-up
    '-background white',                  // add a white background
    '-alpha remove',                      // remove alpha channel
    `'${__dirname + '/tmp/graphic.png'}'` // output file
  ].join(' ');

  try {
    execSync(cmd);
  } catch(err) {
    console.error(String(err));
  }
}());

// ===================================

// Set up the printer
const counter = require('./lib/counter.js');
const printer = require('./lib/printer.js');

// printer is ready to print but intentionally wait a little longer to
// discourage people from spamming the print button
printer.on('ready', function () {
  // blink during throttling delay
  statusLed.blink();

  setTimeout(_ => {
    // now we can print again
    statusLed.on();
    canPrint = true;
  }, 3000);
});

// printing has begun; log the time an sequence number, then
// increment the sequence number
printer.on('printing', function () {
  console.log(`${(new Date()).toISOString()}: Printing #${counter.getCount()}...`);
  counter.increment();
});

// in case of error, log it, and blink the LED
printer.on('error', function (err) {
  statusLed.blink();
  console.error('ERROR', err);
});

// init the printer - this will prepare an in-memory buffer of print commands
// and the ready event will be emitted once the printer's ready
printer.init();

// ===================================

// set up the button
const Button = require('./lib/button.js');
const printButton = new Button(17);

printButton.on('press', function () {
  if (!canPrint) {
    return;
  }

  canPrint = false;
  printer.print();
});
