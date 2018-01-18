// The printer name (assumed to be set up with this name in CUPS)
const PRINTER_NAME = 'EPSON_TM-T20II';

// Path to the PNG to print (image should be 550px wide!)
const IMAGE_PATH = __dirname + '/../receipt.png';

const execSync = require('child_process').execSync;
const printer = require('node-thermal-printer');
const EventEmitter = require('events');

// This class wraps the node-thermal-printer printer obj, but prepares a buffer
// of printer commands ahead of the print being executed.
class EagerPrinter extends EventEmitter {
  init() {
    this.busy = false;

    // Set up the printer
    printer.init({
      // Yes, it's an Epson-brand printer...
      'type': 'epson',

      // The character set doesn't really matter, but for good measure, we set
      // it to DENMARK2, so the base charset includes some Danish letter stuff.
      // The differences between the charsets can be seen here:
      // https://reference.epson-biz.com/modules/ref_charcode_en/index.php?content_id=3
      'characterSet': 'DENMARK2',

      // This relies on the printer having been set up in CUPS with this exact name
      'interface': `printer:${PRINTER_NAME}`
    });

    this.spool();
  }

  get activeJobCount() {
    return parseInt(execSync(`lpstat -a '${PRINTER_NAME}' | wc -l`).toString(), 10);
  }

  clearJobs() {
    execSync(`cancel -a '${PRINTER_NAME}'`);
  }

  spool() {
    if (this.busy) {
      return;
    } else {
      this.busy = true;
    }

    this.emit('spooling');

    // Do some layout
    printer.alignCenter();

    // Buffer an image
    printer.printImage(IMAGE_PATH, (done) => {
      if (!done) {
        this.emit('error', 'Failed to append image');
        return;
      }

      // Buffer a cut command
      printer.partialCut();

      this.busy = false;
      this.emit('ready');
    });
  }

  print() {
    const self = this;

    function awaitJobCompletion() {
      setTimeout(function () {
        // check if there are active jobs still pending
        if (self.activeJobCount > 1) {
          awaitJobCompletion();
          return;
        }

        self.busy = false;
        self.spool();
      }, 100);
    }

    if (this.busy) {
      return;
    } else {
      this.busy = true;
    }

    this.emit('printing');

    printer.execute(function (err) {
      if (err) {
        this.emit('error', 'Printing error');
        return;
      }

      awaitJobCompletion();
    });
  }
};

// export a singleton
module.exports = new EagerPrinter();
