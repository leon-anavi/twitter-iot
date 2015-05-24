var db = null;

try {
  var Promise = require('promise');

  var configurations = require('./config.json');
  var Twit = require('twit')
  var T = new Twit(configurations.twitter);

  var utilsTwitter = require('./twitter');

  var databaseUrl = "twitter-iot";
  var collections = ["crawler"];
  var db = require("mongojs").connect(databaseUrl, collections);

  var utilsData = require('./data');

  //The first promise read the value of the last processed tweet id from the db
  //The second promise finds the latest tweets (after the last processed)
  //The third promise saves the biggest ID of the latest tweets in the db
  //Finally the db is closed
  var promise = new Promise(function (resolve, reject) {
    //Retrive last proceed tweet id
    utilsData.getLastTweetId(db, function(res) { resolve(res); });
  });
  promise.then(function(lastTweetId) {
    //Searching for new tweets
    return new Promise(function (resolve, reject) {
      utilsTwitter.search(T, configurations.search,
                          configurations.retweet, configurations.favorite,
                          lastTweetId, function(err, res) {
        if (null === err) {
          resolve(res);
        }
        else {
          // new tweets have not been found
          // close the database and reject the second promise
          db.close();
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
    //Everything is done, disconnect for the db
    db.close();
  });


  //utilsTwitter.updateStatus(T, 'cool :)');
}
catch(err) {

  //Disconnect for the database on error
  if (null !== db) {
    db.close();
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
