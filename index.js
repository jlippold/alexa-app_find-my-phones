var alexa = require('alexa-app');
var util = require('util');
var config = require('./config.json');
var app = new alexa.app('findmyphone');

var icloud = require("find-my-iphone").findmyphone;

icloud.apple_id = config.apple_id;
icloud.password = config.apple_password;

module.exports = app;
module.change_code = 1;

var alias = Object.keys(config.deviceMap).join("|");

app.intent('FindPhoneIntent', {
	"slots": {
		"device": "LITERAL"
	},
	"utterances": ["find {" + alias + "|device}"]
}, function(request, response) {

	var saidDevice = request.slot('device');
	var possesiveDevice = saidDevice.replace("my", "your");
	var errMsg, msg;

	function replyWithMessage(message) {
		return response.say(message).shouldEndSession(true).send();
	}

	if (!config.deviceMap.hasOwnProperty(saidDevice)) {
		errMsg = util.format("Sorry, I cannot find %s in your device list", possesiveDevice);
		return replyWithMessage(errMsg);
	}

	var deviceName = config.deviceMap[saidDevice].deviceName;

	icloud.getDevices(function(error, devices) {

		if (error) {
			errMsg = "Something when wrong when contacting iCloud"
			console.error(error);
			return replyWithMessage(errMsg);
		}

		var device;

		devices.forEach(function(d) {
			if (d.name == deviceName) {
				device = d;
			}
		});

		if (device) {

			if (device.location == null) {
				msg = util.format("%s is currenly being located, ask me again in a few seconds.", possesiveDevice);
				return response.say(msg).shouldEndSession(true).send();
			}

			var myLatitude = config.latitude;
			var myLongitude = config.longitude;

			icloud.getDistanceOfDevice(device, myLatitude, myLongitude, function(err, miles) {

				if (miles == 0) {
					if (device.lostModeCapable) {
						msg = util.format("%s is less than a mile away, say alexa fire alarm to make the device beep", possesiveDevice);
						device.possesiveDevice = possesiveDevice;
						response.session('device', device);
						return response.say(msg).shouldEndSession(false).send();
					} else {
						msg = util.format("%s is less than a mile away", possesiveDevice);
						return response.say(msg).shouldEndSession(true).send();
					}
				} else {
					msg = util.format("%s is %d miles away. ", possesiveDevice, miles);

					icloud.getLocationOfDevice(device, function(err, location) {
						if (location.streetNumber) {
							msg = util.format(
								"%s, near %s %s in %s, %s",
								msg,
								location.streetNumber,
								location.streetName,
								location.city,
								location.state
							);
						}
						return response.say(msg).shouldEndSession(true).send();
					});
				}

			});

		} else {
			errMsg = util.format("The device %s was not found on your iCloud account", deviceName);
			return replyWithMessage(errMsg);
		}
	});

	return false;
});

app.intent('alarm', {
	"slots": {},
	"utterances": ["fire alarm"]
}, function(request, response) {
	var device = response.session('deviceId');
	var msg;
	
	if (device) {
		msg = "Something went wrong. I could not fire the alarm";
		return response.say(msg).shouldEndSession(true).send();
	} else {
		icloud.alertDevice(device.id, function(err) {
			msg = util.format("%s will now beep", device.possesiveDevice);
			return response.say(msg).shouldEndSession(true).send();
		});
	}
	return false;
});