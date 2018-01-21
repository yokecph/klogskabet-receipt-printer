// A simple class to control an LED

const Gpio = require('onoff').Gpio;

// dummy callback used in a few places
function noop() {}

class Led {

  // initialize a button connected to the given GPIO pin
  constructor(gpioPin) {
    this.gpio = new Gpio(gpioPin, 'out');
    this.state = 0;
    this.blinkTimer = null;
  }

  // turn the led on (set pin high) and cancel any blinking
  on() {
    this.clearBlinkTimer();
    this.state = 1;
    this.gpio.write(this.state, noop);
  }

  // turn the led off (set pin low) and cancel any blinking
  off() {
    this.clearBlinkTimer();
    this.state = 0;
    this.gpio.write(this.state, noop);
  }

  // blink the LED at the givne interval (300ms by default)
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

  // stop blinking and set the given state (equivalent to calling either
  // on() or off())
  stopBlink(state) {
    state ? this.on() : this.off();
  }

  // stop the blink timer (used internally)
  clearBlinkTimer() {
    clearTimeout(this.blinkTimer);
    this.blinkTimer = null;
  }

  // unexport the LED
  destroy() {
    this.gpio.unexport();
  }
}

module.exports = Led;
