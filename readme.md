# Description

This app allows you to ask alexa to locate devices in your apple icloud account.

For example,

`You`: Alexa, ask iCloud to find my phone

`Echo`: Your phone is less than a mile away, say alexa fire alarm to make the device beep

`You`: Alexa, fire alarm

`Echo`: Your phone will now beep.



or if you have family sharing..

`You`: Alexa, ask iCloud to find my wife

`Echo`: Your wife is 3 miles away, near 1600 Pennsylvania Ave in Washington, DC



# Install

Get the [alexa-app-server](https://github.com/matt-kruse/alexa-app-server) running on your server. Follow the instructions in the alexa-app-server readme.

Download this repo, and copy it to `apps/findmyphone` and run npm install. 

Rename or copy the `config-sample.json` to `config.json` and edit the contents accordingly with your icloud user/pass and the latitude/longitude of your home, so that the app can measure distance. Also add your devices to the deviceMap object. Each key is the name you want to call the device.

### Connect with amazon

Create a developers account on amazon. Create a new skill. Name it whatever, Invocation name can be `iCloud`. Intents and utternaces can be determined by going to localhost:8080/findmyphone. Configure ssl, and test the app via the amazon website. At this point you can try it on your echo.


