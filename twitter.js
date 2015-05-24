module.exports = {
  updateStatus: function (handle, message) {
    handle.post('statuses/update', { status: message }, function(err, data, response) {
      if (null === err){
        console.log('OK - status updated.');
      }
      else {
        console.log('FAIL - '+err);
      }
    });
  },

  search: function (handle, search, since, callback) {

    //Set a default value for since
    if (typeof since === "undefined") {
      since = 0;
    }

    //Search for tweets
    handle.get('search/tweets', { q: search, result_type: 'recent', since_id: since, count: 100 }, function(err, data, response) {

      //Ignore the last processed tweet ID if it is among new results

      if ( (0 >= data.statuses.length) || (since === data.statuses[0].id) ) {
        callback('No new tweets found', since);
      }
      else {
        callback(null, data.statuses[0].id);
      }

      for (var nIndex=0; nIndex < data.statuses.length; nIndex++) {
        var status = data.statuses[nIndex];

        if (since === status.id) {
          continue;
        }

        console.log('ID: '+status.id);
        console.log('URL: https://twitter.com/tizendownload/status/'+status.id_str);
        console.log(status.user.name+' (@'+status.user.screen_name+'): '+status.text+'\n\n');
      }

    });
  }

};
