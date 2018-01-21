// Simple evented wrapper for a GPIO button. Button is assumed
// to pull low when pressed

const EventEmitter = require('events');
const Gpio = require('onoff').Gpio;

class Button extends EventEmitter {

  // initialize a button connected to the given GPIO pin
  constructor(gpioPin) {
    super();
    this.gpio = new Gpio(gpioPin, 'in', 'falling');
    this.prevState = this.gpio.readSync();

    // watch for state changes and emit a 'press' event
    // if state changes to low
    this.gpio.watch((err, state) => {
      if (err) {
        console.error('Error in GPIO watch: ', err);
        return;
      }

      if (state !== this.prevState && state === 0) {
        this.emit('press');
      }

      this.prevState = state;
    });
  }

  // unexport the button
  destroy() {
    this.gpio.unexport();
  }

}

module.exports = Button;
