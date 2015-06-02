#! /usr/bin/env node

var db = null;
var mqtt = require('mqtt');
var mqttClient = null;
var configurationsPath = './config.json';

function handleError(err) {

  if ( (typeof err.code !== 'undefined') && ('MODULE_NOT_FOUND' === err.code) ) {
    console.log('Error: please create config.json and save in it the credentials of your Twitter app.');
    console.log('Example configuration is provided in config-sample.json');
  }
  else if (typeof err.message !== 'undefined') {
    console.log('Error: '+err.message);
  }
  else {
    console.log(err);
  }

  if (typeof configurations !== "undefined") {
    //Disconnect the database on error
    if ( (false === configurations.infinite) && (null !== db) ) {
      db.close();
    }

    //Disconnect the MQTT client on error
    if ( (false === configurations.infinite) && (null !== mqttClient) ) {
      mqttClient.end();
    }
    if (false === configurations.infinite) {
      process.exit();
    }
  }
  else {
    // Terminate the script if configurations are not set
    process.exit();
  }
}

function run() {
  try {
    var configurations = require(configurationsPath);
    var Promise = require('promise');

    var Twit = require('twit')
    var T = new Twit(configurations.twitter);

    var utilsTwitter = require('./twitter');

    var databaseUrl = "twitter-iot";
    var collections = ["crawler"];
    if (null === db) {
      db = require("mongojs").connect(databaseUrl, collections);

      db.on('error', function(err) {
        handleError('MongoDB '+err);
      });
    }

    var isMqttConnectionEstablished = false;

    var utilsData = require('./data');

    //The 1st promise connects to MQTT broker
    //The 2nd promise read the value of the last processed tweet id from the db
    //The 3rd promise finds the latest tweets (after the last processed)
    //The 4th promise saves the biggest ID of the latest tweets in the db
    //Finally the db is closed
    var promise = new Promise(function (resolve, reject) {

      if (null !== mqttClient) {
        resolve();
        return;
      }

      mqttClient = mqtt.connect('mqtt://'+configurations.mqtt.hostname);
      mqttClient.on('connect', function () {
        isMqttConnectionEstablished = true;
        resolve();
      });
      mqttClient.on('close', function () {
        //If connection has been established once then there is no need
        //to report and handle connection issues in this event
        if (true === isMqttConnectionEstablished) {
          return;
        }
        handleError('Cannot connect to MQTT broker.');
        reject();
      });

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
                            configurations.reply,
                            configurations.replyMessage,
                            configurations.tweetsCount,
                            configurations.mqtt.enabled,
                            configurations.mqtt.topic,
                            configurations.mqtt.message,
                            lastTweetId, function(err, res) {
          if (null === err) {
            resolve(res);
          }
          else {
            // reject the second promise because new tweets have not been found
            reject(err);
            console.log(err);

            if (false === configurations.infinite) {
              // close the database, disconnect from MQTT broker
              db.close();
              mqttClient.end();
              process.exit();
            }
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
      if (false === configurations.infinite) {
        db.close();
        mqttClient.end();
      }
    });
  }
  catch(err) {
    handleError(err);
  }

  if ( (typeof configurations !== "undefined") && (true === configurations.infinite) ) {
    setInterval(run, configurations.duration*1000);
  }
}

function help() {
  console.log('');
  console.log('NAME');
  console.log('   twitter-iot - twitter bot which communicates with Internet of Things.');
  console.log('');
  console.log('SYNOPSIS');
  console.log('   twitter-iot [options] [file]');
  console.log('');
  console.log('DESCRIPTION');
  console.log('   Open source twitter bot which communicates with Internet of Things over MQTT.');
  console.log('');
  console.log('   -h, --help ');
  console.log('      display this help and exit');
  console.log('');
  process.exit();
}

function unknownArgument() {
  console.log('twitter-iot: invalid option -- '+process.argv[index]);
  console.log('Try with \'--help\' for more information.');
  process.exit();
}

function processArgumnets() {
  var index = ("node" === process.argv[0]) ? 2 : 1;
  for (index; index < process.argv.length; index++){
    switch(process.argv[index]) {
      case "-h":
      case "--help":
        help();
      break;
      default:
        unknownArgument();
      break;
    }
  }
}

processArgumnets();
run();
