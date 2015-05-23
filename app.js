try {
  var configurations = require('./config.json');
  var Twit = require('twit')
  var T = new Twit(configurations.twitter);

  var utils = require('./twitter');

  //utils.updateStatus(T, 'cool :)');
  utils.search(T, configurations.search, 601970250821673000);
}
catch(err) {
  if ( (typeof err.code !== 'undefined') && ('MODULE_NOT_FOUND' === err.code) ) {
    console.log('Error: please create config.json and save in it Twitter credentials.');
    console.log('Example configuration is provided in config-sample.json');
  }
  else if (typeof err.message !== 'undefined') {
    console.log('Error: '+err.message);
  }
  else {
    console.log('Unknown error: '+err);
  }
}
