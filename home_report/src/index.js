var request = require("request");
var fs = require('fs')

var initInflux = function() {
    const Influx = require('influx');
    const influx = new Influx.InfluxDB({
     protocol: "https",
     host: process.env.INFLUXDB_HOST,
     port: process.env.INFLUXDB_PORT,
     database: "home_report",
     username: process.env.INFLUXDB_USER,
     password: process.env.INFLUXDB_USER_PASSWORD,
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
    console.log(metrics);
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
            'authorization': process.env.NEST_TOKEN,
            'content-type': 'application/json'
        }
    };

    request(options, handleNestResponse);
};

requestNestData();
