exports.about = function (req, res){
  res.render('aboutme.html');
};

exports.generator = function (req, res){
  res.render('ball.html');
};

exports.calendar = function (req, res) {
	res.render('timepicker.html');
};

exports.resume = function (req, res){
  res.render('resume.html');
};

exports.index = function (req, res){
  res.render('index.html');
};

exports.fml = function (req, res){
  res.render('fml.html');
};

exports.ideafulWidget = function (req, res) {
  res.render('ideafulwidget.html')
};
