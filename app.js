
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , submit = require('./routes/submit')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , nodemailer = require("nodemailer");

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
app.get('/users', user.list);
app.post('/submit', function(req, res){
  var geo = req.body.obj;
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
