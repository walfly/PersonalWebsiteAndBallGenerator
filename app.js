
/**
 * Module dependencies.
 */

var express = require('express'),
    staticPages = require('./routes/staticpages.js'),
    externals = require('./routes/externals.js'),
    submit = require('./routes/submit.js'),
    http = require('http'),
    path = require('path');

var app = express();
var n = 0;


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', staticPages.index);
app.get('/webGL', staticPages.generator);
app.get('/aboutMe', staticPages.about);
app.get('/github', externals.github);
app.get('/tumbler', externals.tumblr);
app.get('/hashtags', externals.hashtags);
app.get('/LinkedIn', externals.linkedin);
app.get('/resume', staticPages.resume);
app.post('/submit', submit);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
