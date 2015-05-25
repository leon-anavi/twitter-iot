var db = null;
var mqttClient = null;

try {
  var Promise = require('promise');

  var configurations = require('./config.json');
  var Twit = require('twit')
  var T = new Twit(configurations.twitter);

  var utilsTwitter = require('./twitter');

  var databaseUrl = "twitter-iot";
  var collections = ["crawler"];
  var db = require("mongojs").connect(databaseUrl, collections);

  db.on('error', function(err) {
    console.log('MongoDB '+err);

    //Disconnect the MQTT client on error
    if (null !== mqttClient) {
      mqttClient.end();
    }
    process.exit();
  });

  var mqtt = require('mqtt');
  var mqttClient = mqtt.connect('mqtt://'+configurations.mqtt.hostname);

  var utilsData = require('./data');

  //The 1st promise connects to MQTT broker
  //The 2nd promise read the value of the last processed tweet id from the db
  //The 3rd promise finds the latest tweets (after the last processed)
  //The 4th promise saves the biggest ID of the latest tweets in the db
  //Finally the db is closed
  var promise = new Promise(function (resolve, reject) {
    mqttClient.on('connect', function () { resolve(); });
  });
  promise.then(function() {
    return new Promise(function (resolve, reject) {
      //Retrive last proceed tweet id
      utilsData.getLastTweetId(db, function(res) { resolve(res); });
    });
  })
  .then(function(lastTweetId) {
    //Searching for new tweets
    return new Promise(function (resolve, reject) {
      utilsTwitter.search(T, mqttClient, configurations.search,
                          configurations.retweet,
                          configurations.favorite,
                          configurations.tweetsCount,
                          configurations.mqtt.enabled,
                          configurations.mqtt.topic,
                          configurations.mqtt.message,
                          lastTweetId, function(err, res) {
        if (null === err) {
          resolve(res);
        }
        else {
          // new tweets have not been found
          // close the database, disconnect from MQTT broker
          // and reject the second promise
          db.close();
          mqttClient.end();
          reject(err);
          console.log(err);
        }
      });
    });
  })
  .then(function(tweetId) {
    //Save the latest tweet ID to the db
    return new Promise(function (resolve, reject) {
      utilsData.setLastTweetId(db, tweetId, function() {
        resolve();
      });
    });
  })
  .then(function() {
    //Everything is done, disconnect from the db and the MQTT client
    db.close();
    mqttClient.end();
  });


  //utilsTwitter.updateStatus(T, 'cool :)');
}
catch(err) {

  //Disconnect the database on error
  if (null !== db) {
    db.close();
  }

  //Disconnect the MQTT client on error
  if (null !== mqttClient) {
    mqttClient.end();
  }

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
