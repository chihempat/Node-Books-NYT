const http = require('http');


// Async helper function for fetching data from a url

module.exports = (url) => {
  return new Promise((resolve, reject) => {
    http.get(url, function (res) {
      var body = '';
      res.on('data', function (chunk) {
        body += chunk;
      });
      res.on('end', function () {
        resolve(body);
      });
    }).on('error', function (e) {
      reject("Got error: " + e.message);
    });
  });
}