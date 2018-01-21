// This module exposes a singleton/shared instance of the EagerPrinter class
// defined below. This instance is responsible for the actual printing.

// The printer name (assumed to be set up with this name in CUPS)
const PRINTER_NAME = 'EPSON_TM-T20II';

// Path to the PNG to print (this image is prepared in index.js)
const IMAGE_PATH = __dirname + '/../tmp/graphic.png';

const execSync = require('child_process').execSync;
const printer = require('node-thermal-printer');
const EventEmitter = require('events');
const counter = require('./counter.js');

// This class wraps the node-thermal-printer printer object, but prepares
// ("spools") buffer of printer commands ahead of the print being executed.
//
// An instance of this class emits the following events:
// 'spooling': Print is being buffered in memory
// 'ready': Print is buffered and ready to print
// 'printing': The printer is, well, printing
// 'error': An error occurred (a error arg will be passed to handlers)
class EagerPrinter extends EventEmitter {
  init() {
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

    this.busy = false;
    this.spool();
  }

  // get number of jobs queued for the printer
  get activeJobCount() {
    return parseInt(execSync(`sudo lpstat -o '${PRINTER_NAME}' | wc -l`).toString(), 10);
  }

  // delete all jobs for the printer
  clearJobs() {
    execSync(`sudo cancel -a '${PRINTER_NAME}'`);
  }

  // create a buffer that's ready to print
  spool() {
    if (this.busy) {
      return;
    } else {
      this.busy = true;
    }

    this.emit('spooling');

    // Do some layout
    printer.alignCenter();

    // the following builds the buffer "backwards". The images are upside-down
    // and the whole receipt is put together from bottom to top, so it exits the
    // printer right side up (assuming the printer is installed as designed for
    // Klogskabet)

    // buffer the main graphic (or the fallback/default graphic)
    var graphic = __dirname + '/../tmp/graphic.png';
    if (!require('fs').existsSync(graphic)) {
      graphic = __dirname + '/../graphics/default.png';
    }

    printer.printImage(graphic, (done) => {
      if (!done) {
        this.emit('error', 'Failed to append main graphic');
        return;
      }

      // Buffer the divider image
      printer.printImage(__dirname + '/../graphics/divider.png', (done) => {
        if (!done) {
          this.emit('error', 'Failed to append divider image');
          return;
        }

        // print the serial number (upside down, like the graphics)
        printer.alignCenter();
        printer.upsideDown(true); // toggle upside-down
        printer.println(`#${("000000" + counter.getCount()).slice(-6)}`);
        printer.upsideDown(false); // toggle it off again

        // buffer the header image
        printer.printImage(__dirname + '/../graphics/header.png', (done) => {
          if (!done) {
            this.emit('error', 'Failed to append header image');
            return;
          }

          // Buffer a cut command
          printer.partialCut();

          // and we're ready to print again
          this.busy = false;
          this.emit('ready');
        });
      });
    });
  }

  // print the spooled buffer
  print() {
    const self = this;

    // helper function to periodically check if the printer is done
    // (i.e. there are no queued jobs)
    function awaitJobCompletion() {
      setTimeout(function () {
        // check if there are active jobs still pending
        if (self.activeJobCount > 1) {
          // something's still in the pipeline, check again later
          process.nextTick(awaitJobCompletion);
          return;
        }

        // printer is idle, so spool a buffer to be ready for the next print
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

    // send the buffered commands to the printer
    printer.execute(function (err) {
      if (err) {
        this.emit('error', 'Printing error');
        return;
      }

      // start waiting for the printer to finish
      awaitJobCompletion();
    });
  }
};

// export a "singleton"
module.exports = new EagerPrinter();
