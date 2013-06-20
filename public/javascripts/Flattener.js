//to flatten a developable surface simply translate 
//the triangles to the same plane maintaining the distance between vertices

var Flattened = function (geo, y) {
	THREE.Geometry.call(this);

  var self = this;
  var pl = y;

  var square = function (num) {
    return num * num;
  };
  
  var vecdistance3d = function(p1){
    return Math.sqrt(square(p1[0])+square(p1[1])+square(p1[2]));
  };

  var distance3d = function(p1, p2){
    return Math.sqrt(square(p1[0] - p2[0])+square(p1[1] - p2[1])+square(p1[2] - p2[2]));
  };

  var distance2d = function(p1, p2){
    return Math.sqrt(square(p1[0] - p2[0])+square(p1[1] - p2[1]));
  }

  var angleFinder = function (d1, d2, v1, v2) {
    var theta = ((v1[0]*v2[0])+(v1[1]*v2[1])+(v1[2]*v2[2]))/(d1*d2);
    var rad = Math.acos(theta);
    return rad;
  };

  var toVector = function(number) {
    var stringy = number.toString();
    var stringArr = stringy.split('.');
    var wholeNumber = Math.floor(stringArr[0]);
    var decimal = stringArr[1] || '0';
    var holdArray = ['1']
    for (var i = 0; i < decimal.length; i ++){
      holdArray.push('0');
    }
    decimal = Math.floor(decimal);
    var denom = Math.floor(holdArray.join(''));
    denomRet = divideHelper(denom, decimal);
    decimalRet = divideHelper(decimal, denom);
    decimalRet = (denomRet*wholeNumber)+decimalRet;
    return [decimalRet, denomRet];
  };

  var divideHelper = function(number, number2){
    if ((number%5) === 0 && (number2%5) === 0){
      return divideHelper(number/5, number2/5);
    } else if ((number%2) === 0 && (number2%2) === 0){
      return divideHelper(number/2, number2/2);
    } else {
      return number;
    }
  };

  var dirCreate = function(p1, p2) {
    return [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
  };

  var unitCreate = function(st, en){
    var dis = distance2d(st, en);
    var dir = [en[0]-st[0], en[1]-st[1]];
    return [dir[0]/dis, dir[1]/dis];
  };

  var scalarCreate = function(dist, unit){
    return [unit[0]*dist, unit[1]*dist];
  };

  var init = function(geo){
    var length = geo.length, dist1, dist2, dir1, dir2, angle, unit, prevP, prevx = 0, prevy = 0;
    self.vertices.push(new THREE.Vector3(prevx, prevy, pl));
    prevP = [prevx, prevy]
    console.log('test', angleFinder(Math.sqrt(2), 1, [1,1,0], [0,1,0]));
    console.log('test', angleFinder(Math.sqrt(2), 1, [1,-1,0], [0,1,0]));
    for (var i = 2; i < length; i++) {
      dir1 = dirCreate(geo[i-1], geo[i]);
      console.log(dir1);
      dist1 = vecdistance3d(dir1);
      dir2 = dirCreate(geo[i-1],geo[i-2]);
      console.log(dir2);
      dist2 = vecdistance3d(dir2);
      angle = angleFinder(dist1, dist2, dir1, dir2);
      vector = toVector(angle);
      //not calculating relative vector given angle, just angle from primary axis. FIX THIS
      unit = unitCreate(prevP, vector);
      scal = scalarCreate(dist1, unit);
      if(i%2 !== 0){
        prevx -= scal[0];
        prevy -= scal[1];        
      } else {
        prevx += scal[0];
        prevy += scal[1];
      }
      self.vertices.push(new THREE.Vector3(prevx, prevy, pl));
      prevP = [prevx, prevy];
    }
		for (var i = 0; i < self.vertices.length - 2; i ++){
      self.faces.push(new THREE.Face3(i, i+1, i+2));
    }
	};
  init(geo);
  this.computeCentroids();
  this.computeFaceNormals();
};

Flattened.prototype = Object.create(THREE.Geometry.prototype);
Flattened.prototype.constructor = Flattened;