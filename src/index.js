var request = require("request");
var fs = require('fs')

var handleNestResponse = function(error, response, body) {
    if (error) throw new Error(error);

    var response = {};
    var thermostats = JSON.parse(body).devices.thermostats;
    Object.keys(thermostats).forEach( function(key) {
        var thermostat = thermostats[key];
        response[thermostat.name] = {
            ambient_temperature_c: thermostat.ambient_temperature_c,
            target_temperature_c: thermostat.target_temperature_c,
            hvac_state: thermostat.hvac_state
        }
    });
    console.log(response);
};

var requestNestData = function(err, data) {
    var token;
    if (err) {
        console.log("/run/secrets/nest_token not found");
        token = process.env.NEST_TOKEN
    } else {
        token = data.trim();
    }

    var options = {
        method: 'GET',
        url: 'https://developer-api.nest.com/',
        headers: {
            'cache-control': 'no-cache',
            'authorization': token,
            'content-type': 'application/json'
        }
    };

    request(options, handleNestResponse);
};

fs.readFile('/run/secrets/nest_token', 'utf8', requestNestData);
