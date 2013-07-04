
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    ball = require('./routes/ball.js'),
    submit = require('./routes/submit.js'),
    about = require('./routes/about.js'),
    github = require('./routes/github.js'),
    tumblr = require('./routes/tumblr.js'),
    design = require('./routes/design.js'),
    linkedin = require('./routes/linkedin.js'),
    resumel = require('./routes/resume.js'),
    objMaker = require('./routes/submit.js'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    nodemailer = require("nodemailer");

var app = express();
var n = 0;

var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "Walker.Flynn.OBJ@gmail.com",
        pass: "FH113pps"
    }
});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
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

app.get('/', routes.index);
app.get('/webGL', ball.generator);
app.get('/aboutMe', about);
app.get('/github', github);
app.get('/tumbler', tumblr);
app.get('/design', design);
app.get('/LinkedIn', linkedin);
app.get('/resume', resumel);
app.post('/submit', function(req, res){
  var geometry = new objMaker.Ball(req.body.inner, req.body.outer, req.body.surface, req.body.thick);
  var geo = geometry.obj;
  var email = req.body.email;
  var mailOptions = {
    from: "Walker.Flynn.OBJ@gmail.com", // sender address
    to: email, // list of receivers
    subject: "Your Ball Object", // Subject line
    text: "Thanks for using my ball generator. If you do actually build this thing send me a picture at this email address and submit it to Instagram #FlynnBall.", // plaintext body
    attachments: [
      {
        fileName: "yourBall.obj",
        contents: geo 
      }
    ]
  }
  smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
      console.log(error);
    }else{
      console.log("Message sent: " + response.message);
    }
  });
  res.writeHead(200);
  res.end();
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
