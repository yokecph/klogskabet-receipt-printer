const Gpio = require('onoff').Gpio;

function noop() {}

// a very simple LED class
class Led {

  constructor(gpioPin) {
    super();
    this.gpio = new Gpio(gpioPin, 'out');
    this.state = 0;
  }

  on() {
    this.gpio.write(1, noop);
  }

  off() {
    this.gpio.write(0, noop);
  }

  blink(interval) {
    const self = this;

    interval = interval || 300;

    function blink() {
      self.state ^= 1;
      self.gpio.write(self.state);
      self.blinkTimer = setTimeout(blink, interval);
    }

    blink();
  }

  stopBlink() {
    clearTimeout(this.blinkTimer);
    this.off();
  }

  destroy() {
    this.gpio.unexport();
  }
}

module.exports = Led;
