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
The code currently does a couple of simple things:

1. It listens for a button being pressed
2. When the button is pressed, it prints an image

That's it.

The image that's printed is whatever's in `<path to app dir>/receipt.png`. The image should be no wider than roughly 580px to fit on the printer's 80mm paper; 550px seems like a good size.

## Development
The version number in `package.json` should be bumped for new releases (and `npm install` should be run to update `package-lock.json` before committing!).

### Known issues
- Trying to print without the printer connected is reported as success, since the print job is queued. But it doesn't start back up when the printer's connected later. This is more likely CUPS's behavior than this code's, but something to be aware of.

### Roadmap
- Register as a service to have it start automatically on boot.

- Host app in `forever.js`?

### Committing
Adhere to the `git-flow` model for branching etc..

## Deployment
TBD.

## Version history
### 1.0.0
Initial commit. Just prints an image and exits.
