// Set up the printer
const printer = require('./lib/printer.js');

printer.on('spooling', _ => console.log('spooling'));
printer.on('ready', _ => console.log('ready'));
printer.on('printing', _ => console.log('ready'));
printer.on('error', (desc) => console.log('error:', desc));

printer.init();


const Button = require('./lib/button.js');
const printButton = new Button(17);

printButton.on('press', function () {
  printer.print();
});
