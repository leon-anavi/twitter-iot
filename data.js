function getBotSince(botId) {
  return botId + "-since";
}

function getLastTweetId(botId, db, callback) {

  db.crawler.find({type: getBotSince(botId) }, function(err, data) {
    var lastProcessedTweet = 0;
    if( (null != err) || (0 == data.length) ) {
      //save a default value
      //this part of the code will be run only once at first launch of the script
      initLastTweetId(botId, db);
    }
    else {
      lastProcessedTweet = data[0].id;
    }
    callback(lastProcessedTweet);
  });

}

function initLastTweetId(botId, db) {

  db.crawler.save({type: getBotSince(botId), id: 0}, function(err, saved) {
    if( err || !saved ) {
      console.log("ERROR! Unable to save data: "+err);
    }
    else {
      console.log("Data saved.");
    }
  });

}

function setLastTweetId(botId, db, tweetId, callback) {

  console.log('Latest tweet ID: '+tweetId);

  db.crawler.update({type: getBotSince(botId) }, {$set: {id: tweetId}}, function(err, updated) {
    if( err || !updated ) {
      console.log("Tweet ID not updated");
    }
    else {
      console.log("Tweet ID updated");
    }
    callback();
  });

}

module.exports = {

  getLastTweetId : getLastTweetId,

  setLastTweetId : setLastTweetId,

};
