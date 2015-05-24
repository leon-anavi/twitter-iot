module.exports = {

  getLastTweetId : getLastTweetId,

  setLastTweetId : setLastTweetId,

};

function getLastTweetId(db, callback) {

  db.crawler.find({type: "since"}, function(err, data) {
    var lastProcessedTweet = 0;
    if( (null != err) || (0 == data.length) ) {
      //save a default value
      //this part of the code will be run only once at first launch of the script
      initLastTweetId(db);
    }
    else {
      lastProcessedTweet = data[0].id;
    }
    callback(lastProcessedTweet);
  });

}

function initLastTweetId(db) {

  db.crawler.save({type: "since", id: 0}, function(err, saved) {
    if( err || !saved ) {
      console.log("ERROR! Unable to save data: "+err);
    }
    else {
      console.log("Data saved.");
    }
  });

}

function setLastTweetId(db, tweetId, callback) {

  console.log('Latest tweet ID: '+tweetId);

  db.crawler.update({type: "since"}, {$set: {id: tweetId}}, function(err, updated) {
    if( err || !updated ) {
      console.log("Tweet ID not updated");
    }
    else {
      console.log("Tweet ID updated");
    }
    callback();
  });

}
