var request = require("request");
var fs = require('fs')

var influx_host;
var influx_port;
var influx_user;
var influx_password;
var nest_token;


var initInflux = function() {
    const Influx = require('influx');
    const influx = new Influx.InfluxDB({
     host: process.env.INFLUXDB_HOST,
     port: process.env.INFLUXDB_PORT,
     database: "home_report",
     username: process.env.INFLUXDB_USER,
     password: influx_password,
     schema: [
       {
         measurement: "thermostat",
         fields: {
           ambient_temperature_c: Influx.FieldType.FLOAT,
           target_temperature_c: Influx.FieldType.FLOAT,
           hvac_state: Influx.FieldType.INTEGER
         },
         tags: [
           "name"
         ]
       }
     ]
 });

 return influx;
}

var logToInflux = function(metrics) {
    var influx = initInflux();
    influx.writePoints(metrics).then(
        () => {console.log("Write to InfluxDB complete");},
        (err) => {console.log("Failed to write to InfluxDb: " + err);}
    );
};

var handleNestResponse = function(error, response, body) {
    if (error) throw new Error(error);

    var metrics = [];
    var thermostats = JSON.parse(body).devices.thermostats;
    Object.keys(thermostats).forEach( function(key) {
        var thermostat = thermostats[key];
        metrics.push({
            measurement: "thermostat",
            fields: {
                ambient_temperature_c: thermostat.ambient_temperature_c,
                target_temperature_c: thermostat.target_temperature_c,
                hvac_state: thermostat.hvac_state === "heating" ? 1 : 0
            },
            tags: {
                name: thermostat.name
            }
        });
    });
    logToInflux(metrics);
};

var requestNestData = function() {
    var options = {
        method: 'GET',
        url: 'https://developer-api.nest.com/',
        headers: {
            'cache-control': 'no-cache',
            'authorization': nest_token,
            'content-type': 'application/json'
        }
    };

    request(options, handleNestResponse);
};

const initialise = function() {
    try{
        nest_token =
            fs.readFileSync('/run/secrets/nest_token', 'utf8').trim();
    } catch(e) {
        console.log("unable to read /run/secrets/nest_token: " + e);
        throw e;
    }

    try{
        influx_password =
            fs.readFileSync('/run/secrets/influx_pass', 'utf8').trim();
    } catch(e) {
        console.log("unable to read /run/secrets/influx_pass: " + e);
        throw e;
    }

    if (process.env.INFLUXDB_HOST) {
        influx_host = process.env.INFLUXDB_HOST;
    } else {
        console.log("Missing env variable:INFLUXDB_HOST");
        throw new exception("Missing env variable:INFLUXDB_HOST");
    }

    if (process.env.INFLUXDB_PORT) {
        influx_port = process.env.INFLUXDB_PORT;
    } else {
        console.log("Missing env variable:INFLUXDB_PORT");
        throw new exception("Missing env variable:INFLUXDB_PORT");
    }

    if (process.env.INFLUXDB_USER) {
        influx_user = process.env.INFLUXDB_USER;
    } else {
        console.log("Missing env variable:INFLUXDB_USER");
        throw new exception("Missing env variable:INFLUXDB_USER");
    }
};

initialise();
requestNestData();
