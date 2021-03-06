var PNG = require('png-js');
var net = require('net');
var m   = require('mraa');
var async = require('async');


async.map(process.argv.slice(2), function (item, cb) { PNG.decode(item, function (pxls) { return cb(null, pxls); }) }, function (err, results) {
  var combined = [];
  for(var j = 0; j < results.length; j++) {
    var pixels = results[j];
    var red = []
    var green = []
    var blue = []
    // pixels is a 4096-byte array
    // every four-byte group is a pixel
    // need to output three 1024-byte arrays of 1 or 0
    for(var i = 0; i < 4096; i = i + 4) {
      red_byte = pixels[i];
      green_byte = pixels[i+1];
      blue_byte = pixels[i+2];

      red.push(red_byte < 128 ? 0 : 1);
      green.push(green_byte < 128 ? 0 : 1);
      blue.push(blue_byte < 128 ? 0 : 1);
    }

    combined = combined.concat(red, green, blue);
  }

  var client = net.connect({port: 6592}, function() {
      console.log('connected to server!');
      var buf = new Buffer(combined);
      //for (var i = 0; i < buf.length; i++) { buf[i] = 0; }
      console.log("Writing " + buf.length);
      client.write(buf);
  });
  client.on('data', function(data) {
    console.log(data.toString());
    client.end();
  });
  client.on('end', function() {
    console.log('disconnected from server');
  });


});

