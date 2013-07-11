exports.about = function (req, res){
  res.render('aboutme.html');
};

exports.generator = function (req, res){
  res.render('ball.html');
};


exports.resume = function (req, res){
  res.render('resume.html');
};

exports.index = function (req, res){
  res.render('index.html');
};
