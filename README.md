# Klogskabet - Receipt printer
©2017 YOKE ApS. GPLv3 licensed.

## Description
This is a minimal Node.js app for the Klogskabet project, which can print a receipt on an connected thermal printer (i.e. receipt printer).

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
NOTE: The following assumes you're running a regular Raspberry Pi with a passwordless-sudo `pi` user account. The config files for this app assumes the app will be installed in `/home/pi/klogskabet-receipt-printer/`.

Of course it also assumes that the receipt module has been built to specifications.

First, install dependencies (Node.js 8.x, device-tree compiler, and CUPS):

    $ curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
    $ sudo apt-get update
    $ sudo apt-get install -y nodejs build-essential device-tree-compiler cups libcups2-dev libcupsimage2-dev

Then install the `epsonsimplecups` printer driver:

    $  wget 'https://github.com/plinth666/epsonsimplecups/archive/master.zip'
    $  unzip master.zip
    $  cd epsonsimplecups-master
    $  sudo make
    $  sudo make install

Make the `pi` user a CUPS admin and enable the web UI:

    $ sudo usermod -a -G lpadmin pi
    $ sudo cupsctl --remote-admin
    $ sudo service restart cups

Now go to `https://<IP address of Raspberry Pi>:631/admin` from a browser on the network (you'll get an SSL warning, but continue anyway). If/when you're asked to log in, log in as `pi` with the password for the `pi` user.

Make sure the printer is connected via USB and switched on. When you press "Add printer" in the CUPS UI, the printer should be shown at the top of the list as a "Local printer".

Choose it, and click "Continue". Name the printer `EPSON_TM-T20II` (this is what the code expects it to be called), and optionally fill in the description and location.

On the next screen, choose the `Epson TM-T20` PPD in the list, and click "Add printer". For the default options, you'll want to set "Media size" to "80mm x 100mm" and click "Set Default Options" to save the setting.

Download or clone this source code, and cd into the `/home/pi/klogskabet-receipt-printer` directory (if you've downloaded a .zip from GitHub, you may have to rename the directory to get rid of the branch name).

    $ cd klogskabet-receipt-printer

Compile the device tree overlay for the button, and move it to `/boot/overlays/`:

    $ dtc -W no-unit_address_vs_reg -@ -I dts -O dtb -o ./devicetree/klogskabet-receipt-button.dtbo ./devicetree/klogskabet-receipt-button.dts
    $ sudo cp ./devicetree/klogskabet-receipt-button.dtbo /boot/overlays/klogskabet-receipt-button.dtbo
    $ sudo chown root:root /boot/overlays/klogskabet-receipt-button.dtbo

Install the overlay by editing `/boot/config.txt` again and add the line `dtoverlay=klogskabet-receipt-button`.

Install npm packages:

    $ npm install

Reboot the Raspberry Pi:

    $ sudo reboot

Test the setup by issuing:

    $ cd klogskabet-receipt-printer && sudo node index.js

The module should print the default receipt when you press the button (once the app's started up).

Provided everything works, perform these final two steps to make the app start automatically and manage log files:

Install the logrotate configuration:

    $ sudo cp ./config/klogskabet-receipt-printer.logrotate /etc/logrotate.d/klogskabet-receipt-printer.logrotate
    $ sudo chmod 0644 /etc/logrotate.d/klogskabet-receipt-printer.logrotate
    $ sudo chown root:root /etc/logrotate.d/klogskabet-receipt-printer.logrotate

And install the systemd service script:

    $ sudo cp ./config/klogskabet-receipt-printer.service /lib/systemd/system/klogskabet-receipt-printer.service
    $ sudo systemctl daemon-reload
    $ sudo systemctl enable klogskabet-receipt-printer.service

Reboot the Pi to ensure it starts up automatically. If you need to stop it when it's running as a service, you can issue:

    $ sudo systemctl stop klogskabet-receipt-printer.service

And conversely, to start it again:

    $ sudo systemctl start klogskabet-receipt-printer.service

## Development
The version number in `package.json` should be bumped for new releases (and `npm install` should be run to update `package-lock.json` before committing!).

### Known issues
- Trying to print without the printer connected is reported as success, since the print job is queued. But it doesn't start back up when the printer's connected later. This is more likely CUPS's behavior than this code's, but something to be aware of.

### Committing
Adhere to the `git-flow` model: `master` is for stable and versioned releases, `develop` is the branching point for new features.

## Version history
### 1.0.0
Initial release.

# License
See `COPYING`.
