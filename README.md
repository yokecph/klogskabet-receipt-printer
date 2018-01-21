# Klogskabet - Receipt printer
©2017 YOKE ApS. All rights reserved.

## Description
This is a minimal Node.js app, which can print a receipt on an connected thermal printer (i.e. receipt printer).

The code specifically targets/has been tested with a Raspberry Pi 3 running Raspbian and an Epson TM-T20II printer.

## Requirements
- Raspbian "stretch"
- Node.js 8.x & npm
- ImageMagick
- An Epson TM-T20II thermal printer
- CUPS and the [epsonsimplecups PPD](https://github.com/plinth666/epsonsimplecups)

## Overview
The code does a couple of things:

1. It loads a custom image, and scales/rotates it so it'll be right side up when printed
1. It listens for a button being pressed (GPIO pin falling low)
2. When the button is pressed, it prints the image along with a header with a sequence number that gets incremented each print
3. It blinks an LED while it waits for the print job to finish

The image that's printed is whatever's in `<path to app dir>/receipt.png`. The image will be scaled to 550px (if larger than that) and rotated 180 degrees (and alpha will be replaced with white).

## Installation
TODO

## Development
The version number in `package.json` should be bumped for new releases (and `npm install` should be run to update `package-lock.json` before committing!).

### Known issues
- Trying to print without the printer connected is reported as success, since the print job is queued. But it doesn't start back up when the printer's connected later. This is more likely CUPS's behavior than this code's, but something to be aware of.

### Committing
Adhere to the `git-flow` model: `master` is for stable and versioned releases, `develop` is the branching point for new features.

## Version history
### 1.0.0
Initial commit. Just prints an image and exits.
