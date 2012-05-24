var request = require('request')
  , _ = require('underscore')
  , querystring = require('querystring')
  , util = require('util')

module.exports = function(opts, callback) {
  opts = _.defaults(opts, {
        source: 'en'
      , target: 'fr'
      , key: 'secret'
      , q: 'text'
    });


  function _translate(opts, callback) {
    var url = 'https://www.googleapis.com/language/translate/v2?' + querystring.stringify(opts);
    
    if (opts.source == opts.target) {
      var strings = util.isArray(opts.q) ? opts.q : [opts.q];
      var result = {};

      strings.forEach(function(orig, i){
        result[orig] = strings[i];
      });
      callback(result);
      console.log("English > English Translation - skipping");
      return;
    }
    
    request.get(url, function(err, response, body){
      if (err) throw err;
      var json = JSON.parse(body);
      if (json.error) {
        throw json.error.message;
      }
      var strings = util.isArray(opts.q) ? opts.q : [opts.q];
      var result = {};

      strings.forEach(function(orig, i){
        result[orig] = json.data.translations[i].translatedText;
      });
      callback(result);
    });
  }
  
    
  function _detectAndTranslate(opts, callback) {
    var detectOpts = {
      key: opts.key,
      q: opts.q
    };
    var url = 'https://www.googleapis.com/language/translate/v2/detect?' + querystring.stringify(detectOpts);

    request.get(url, function(err, response, body) {
      if (err) throw err;
      var json = JSON.parse(body);
      if (json.error){
        throw json.error.message;
      }
      var strings = util.isArray(opts.q) ? opts.q : [opts.q];
      var sourceLangs = {};
      opts.source = json.data.detections[0][0].language;
      console.log(opts.source + " > English Translation - skipping");
      _translate(opts, callback);
    });
  }
  
  if (opts.source == 'auto') {
    _detectAndTranslate(opts, callback);
  } else {
    _translate(opts, callback);
  }
  
  
  };
