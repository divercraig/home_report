var request = require("request");
var fs = require('fs')

fs.readFile('/run/secrets/nest_token', 'utf8', function (err,data) {
    var token;
    if (err) {
        console.log("/run/secrets/nest_token not found");
        token = process.env.NEST_TOKEN
    } else {
        token = data.trim();
    }

    console.log(token);
    var options = {
        method: 'GET',
        url: 'https://developer-api.nest.com/',
        headers: {
            'cache-control': 'no-cache',
            'authorization': token,
            'content-type': 'application/json'
        }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log(body);
    });
});
