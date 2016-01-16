# Description

This app allows you to ask Alexa to locate devices in your apple icloud account.

For example,

`You`: Alexa, ask iCloud to find my phone

`Alexa`: As of a few seconds ago, your phone is less than 10 feet away

------ 

`You`: Alexa, ask iCloud to find my wife

`Alexa`: As of a few seconds ago, your wife is 3 miles away, nearby 1600 Pennsylvania Ave in Washington, DC. Approximate driving time: 2 hours and 30 minutes

------

`You`: Alexa, ask iCloud to alert my phone

`Alexa`: Your phone will now beep.


# Install

Get the [alexa-app-server](https://github.com/matt-kruse/alexa-app-server) running on your server. Follow the instructions in the alexa-app-server readme.

Download this repo, and copy it to `apps/findmyphone` and run npm install. 

Rename or copy the `config-sample.json` to `config.json` and edit the contents accordingly with your icloud user/pass and the latitude/longitude of your home, so that the app can measure distance. Also add your devices to the deviceMap object. Each key is the name you want to call the device.

### Connect with amazon

Create a developers account on amazon. Create a new skill. Name it whatever, Invocation name can be `iCloud`. Intents and utternaces can be determined by going to localhost:8080/findmyphone. Configure ssl, and test the app via the amazon website. At this point you can try it on your echo.


