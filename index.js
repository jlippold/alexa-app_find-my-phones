var alexa = require('alexa-app');
var util = require('util');
var moment = require('moment');
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
	var invocation = config.app_name;
	var errMsg, msg;

	var instructions = util.format("You can also say, Alexa, ask %s to alert %s", invocation, saidDevice);

	if (!config.deviceMap.hasOwnProperty(saidDevice)) {
		errMsg = util.format("Sorry, I cannot find %s in your device list", possesiveDevice);
		return replyWithMessage(response, errMsg);
	}

	var deviceName = config.deviceMap[saidDevice].deviceName;

	icloud.getDevices(function(error, devices) {

		if (error) {
			errMsg = "Something when wrong when contacting iCloud"
			console.error(error);
			return replyWithMessage(response, errMsg);
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
				return replyWithMessage(response, msg);
			}

			var myLatitude = config.latitude;
			var myLongitude = config.longitude;

			icloud.getDistanceOfDevice(device, myLatitude, myLongitude, function(err, result) {

				if (result && result.distance && result.distance.value) {

					var meters = result.distance.value;
					var miles = Math.floor(meters * 0.000621371192);
					var feet = Math.floor(meters * 3.28084);

					msg = "";

					if (device.location.timeStamp) {
						var lastLocated = moment(device.location.timeStamp);
						var now = moment();
						var lastSeen = moment.duration(now.diff(lastLocated)).humanize();
						msg = "As of " + lastSeen + " ago, ";
					}

					if (feet <= 1000) {
						msg = util.format("%s %s is probably in the house, only %d feet away. %s",
							msg, possesiveDevice, feet, instructions);

						return replyWithMessage(response, msg);
					} else {

						if (miles < 1) {
							msg = util.format("%s %s is %d feet away. %s", msg, possesiveDevice, feet, instructions);
							return replyWithMessage(response, msg);
						} else {
							msg = util.format("%s %s is %d miles away", msg, possesiveDevice, miles);

							icloud.getLocationOfDevice(device, function(err, location) {
								if (location) {
									msg = util.format("%s, near %s", msg, location);
									if (result.duration) {
										msg = util.format("%s. Approximate driving time %s", msg, result.duration.text);
									}
								}
								return replyWithMessage(response, msg);
							});
						}
					}
				} else {
					return replyWithMessage(response, "Sorry, I can not calculate the distance of this device.");
				}
			});
		} else {
			errMsg = util.format("The device %s was not found on your iCloud account", deviceName);
			return replyWithMessage(response, errMsg);
		}
	});

	return false;
});

app.intent('AlertPhoneIntent', {
	"slots": {
		"device": "LITERAL"
	},
	"utterances": ["alert {" + alias + "|device}"]
}, function(request, response) {

	var saidDevice = request.slot('device');
	var possesiveDevice = saidDevice.replace("my", "your");
	var errMsg, msg;

	if (!config.deviceMap.hasOwnProperty(saidDevice)) {
		errMsg = util.format("Sorry, I cannot find %s in your device list", possesiveDevice);
		return replyWithMessage(response, errMsg);
	}

	var deviceName = config.deviceMap[saidDevice].deviceName;
	var device;

	icloud.getDevices(function(error, devices) {
		if (error) {
			console.log(error);
			return replyWithMessage(response, "Something when wrong when contacting iCloud");
		}

		devices.forEach(function(d) {
			if (device == undefined && d.lostModeCapable && d.name == deviceName) {
				device = d;
			}
		});

		if (device) {
			icloud.alertDevice(device.id, function(err) {
				msg = util.format("%s will now beep", possesiveDevice);
				return replyWithMessage(response, msg);
			});
		} else {
			errMsg = util.format("The device %s was not found on your iCloud account", deviceName);
			return replyWithMessage(response, errMsg);
		}
	});

	return false;
});

function replyWithMessage(response, message) {
	return response.say(message).shouldEndSession(true).send();
}