# Klogskabet - Receipt printer
©2017 YOKE ApS. All rights reserved.

## Description
This is a minimal Node.js app, which can print a receipt on an connected thermal printer (i.e. receipt printer).

The code specifically targets/has been tested with a Raspberry Pi 3 running Raspbian and an Epson TM-T20II printer.

## Requirements
- Raspbian "stretch"
- Node.js 8.x & npm
- An Epson TM-T20II thermal printer
- CUPS and the [epsonsimplecups PPD](https://github.com/plinth666/epsonsimplecups)

## Overview
The app is entirely contained in the `index.js` file as it's rather simple.

This is a very early version, that doesn't do a whole lot.

The code currently does _one single thing_: It prints an image on the printer, and exits. That's it.

The image that's printed is whatever's in `tmp/test.png`. The image should be no wider than roughly 580px to fit on the printer's 80mm paper.

## Development
The version number in `package.json` should be bumped for new releases (and `npm install` should be run to update `package-lock.json` before committing!).

### Known issues
- Printing just text does not work reliably. It seems as if there's a buffer that must be saturated before anything happens, but even then the text is only printed once and sometimes garbled. The callback never reports failure, though. (Possible fix: Just send things to the `lp` command, see below.)

- Trying to print without the printer connected is reported as success, since the print job is queued. But it doesn't start back up when the printer's connected later. This is more likely CUPS's behavior than this code's, but something to be aware of.

- Printing an image is slow and "stuttering", which doesn't seem like 

### Roadmap
- Trigger printing on Raspberry Pi GPIO button-push (see, for instance, [this npm package](https://github.com/fivdi/onoff))

- Download file/content to print from CMS.

- Print a file using `lp` instead of `node-thermal-printer` for better rasterization and automatic scaling?

- Register as a service to have it start automatically on boot.

- Host app in `forever.js`?

### Committing
Adhere to the `git-flow` model for branching etc..

## Deployment
TBD.

## Version history
### 1.0.0
Initial commit. Just prints an image and exits.
