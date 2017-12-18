const EventEmitter = require('events');
const Gpio = require('onoff').Gpio;

class Button extends EventEmitter {

  constructor(gpioPin) {
    super();
    this.gpio = new Gpio(gpioPin, 'in', 'falling');
    this.prevState = this.gpio.readSync();
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

  destroy() {
    this.gpio.unexport();
  }

}

module.exports = Button;
