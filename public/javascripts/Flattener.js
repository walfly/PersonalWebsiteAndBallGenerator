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

  // var solver = function(d1, d2){
  //   var fd = square(d2);
  //   var ld = square(d1);
  //   var deltaXSquared = (-fd + ld)/2;
  //   var deltaYSquared = -(deltaXSquared) + fd;
  //   return [Math.sqrt(Math.abs(deltaXSquared)), Math.sqrt(Math.abs(deltaYSquared))];
  // }

  var angleFinder = function (d1, d2, v1, v2) {
    var theta = ((v1[0]*v2[0])+(v1[1]*v2[1])+(v1[2]*v2[2]))/(d1*d2);
    var rad = Math.acos(theta);
    var deg = rad*180/Math.PI;
    return deg;
  };

  var dirCreate = function(p1, p2) {
    return [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
  };

  var init = function(geo){
    var length = geo.length, dist1, dist2, dir1, dir2, prevx = 0, prevz = 0;
    self.vertices.push(new THREE.Vector3(prevx, prevz, pl));
    dist1 = distance3d(geo[1], geo[0]);
    prevx+= dist1;
    self.vertices.push(new THREE.Vector3(prevx, prevz, pl));
    console.log('test', angleFinder(Math.sqrt(2), 1, [1,1,0], [0,1,0]))
    for (var i = 2; i < length; i++) {
      dir1 = dirCreate(geo[i-1], geo[i]);
      dist1 = vecdistance3d(dir1);
      dir2 = dirCreate(geo[i-1],geo[i-2]);
      dist2 = vecdistance3d(dir2);
      angle = angleFinder(dist1, dist2, dir1, dir2);
      console.log(angle);
      // deltas = solver(dist1, dist2);
      // console.log(deltas);
      if(i%2 !== 0){
        prevx += dist2;
        prevz += dist1;        
      } else {
        prevz += dist2;
        prevx += dist1;
      }
      self.vertices.push(new THREE.Vector3(prevx, prevz, pl));
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