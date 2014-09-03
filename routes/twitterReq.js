var Twit = require('twit');
var _ = require('underscore');
var twitter = new Twit ({
  "consumer_key": "epzVebAjChcbzeA3CHpIxq4aC",
  "consumer_secret": "Dr6hiVALssoB39qZY9AONsGugptbDf7ErmGCblwQibKw2jV7RA",
  "access_token": "401210692-YB3lcCugHlQqCDaI3fjr8g5fNfybykPagYy5lMS1",
  "access_token_secret": "A1F2zp4O9aAGpK6B6BZ57NpFn3YHfEpR0AmKOsZozWX5s"
});

module.exports = function (req, res) {
  var params = {
    q: req.query.search,
    count: 100,
    lang:'en'
  };
  if(req.query.latest){
    params.since_id = req.query.latest;
  }
  twitter.get('search/tweets', params, function (err, data, response) {
    var statuses = _.map(data.statuses, function (status) {
      var text = ' @' + status.user.screen_name + ': ' + status.text;
      return {
        text: text,
        id: status.id_str,
        textArr: text.split('')
      }
    });
    res.send({
      latest: data.statuses[0].id,
      statuses: statuses
    });
  });
};