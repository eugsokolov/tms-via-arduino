Over confidence experiment with Professor Julian Keenan of Montclair State University
Using Google Chrome App

Note: on Mac OS X Lion, it's necessary to update USB Serial drivers:
http://geekscape.posterous.com/mac-os-x-17-lion-upgrading-ftdi-usb-serial-dr


Using 
* [Serial API](http://developer.chrome.com/apps/app.hardware.html#serial)



To set up Chrome App:

1. Download zip and unpack this project

2. In Google-Chrome, enter hyperlink "chrome://extensions"

3. In top right, make sure option "Developer mode" is checked

4. Click "Load unpacked extension..."

5. Point to the correct unzipped project directory

6. A new project "Keenan: Overconfidence Experiment" will appear. Click Launch to run!


To Run the Experiment:

1. Set images in the images/ folder to correspond to the correct timing to the instructor's desire. Configure the js/main.js file to display the images you wish to display during the easy, medium, and hard stages of the experiement.

2. Follow onscreen instructions in the app that you launched, make sure to give correct input arguments (including the serial port on which Arduino TMS module is on). Images will be shown according to configuration in step 1. Note: if the serial port  to the Arduino-TMS module is set incorrectly, the program will fail when attempting to fire the TMS.

3. Run the experiment.

4. A log file will download with recorded results

5. Profit
