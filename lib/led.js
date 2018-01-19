const Gpio = require('onoff').Gpio;

function noop() {}

// a very simple LED class
class Led {

  constructor(gpioPin) {
    this.gpio = new Gpio(gpioPin, 'out');
    this.state = 0;
    this.blinkTimer = null;
  }

  on() {
    this.clearBlinkTimer();
    this.state = 1;
    this.gpio.write(this.state, noop);
  }

  off() {
    this.clearBlinkTimer();
    this.state = 0;
    this.gpio.write(this.state, noop);
  }

  blink(interval) {
    const self = this;

    if (self.blinkTimer) return;

    interval = interval || 300;

    function blink() {
      self.state ^= 1;
      self.gpio.write(self.state, noop);
      self.blinkTimer = setTimeout(blink, interval);
    }

    blink();
  }

  stopBlink(state) {
    state ? this.on() : this.off();
  }

  clearBlinkTimer() {
    clearTimeout(this.blinkTimer);
    this.blinkTimer = null;
  }

  destroy() {
    this.gpio.unexport();
  }
}

module.exports = Led;
