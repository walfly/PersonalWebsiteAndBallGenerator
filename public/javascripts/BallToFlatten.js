BallToFlat = function (innerRadius, outerRadius, number) {
   
  var self = this;
  if(typeof number === 'string'){
    number = parseInt(number);
  }
  if(typeof innerRadius === 'string'){
    innerRadius = parseInt(innerRadius);
  }
  if(typeof outerRadius === 'string'){
    outerRadius = parseInt(outerRadius);
  }

  var Sphere = function(radius){
    this.c = [0,0,0];
    this.r = radius;
  };

  var XLine = function(slope, xCoord){
    this.slope = slope;
    this.isNeg = false;
    this.axis = 'x';
    this.o = [xCoord, 0, 0]
    this.e = [xCoord, slope[0], slope[1]] 
  };

  var XLineNeg = function(slope, zCoord){
    this.slope = slope;
    this.isNeg = true;
    this.axis = 'x';
    this.o = [zCoord, 0, 0]
    this.e = [zCoord, -slope[0], slope[1]] 
  };

  var YLine = function(slope, yCoord){
    this.slope = slope;
    this.isNeg = false;
    this.axis = 'y';
    this.o = [0, yCoord, 0]
    this.e = [slope[0], yCoord, slope[1]] 
  };

  var YLineNeg = function(slope, yCoord){
    this.slope = slope;
    this.isNeg = true;
    this.axis = 'y';
    this.o = [0, yCoord, 0]
    this.e = [-slope[0], yCoord, slope[1]] 
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
  }

  var square = function(f){
    return f * f;
  }

  var sphereInterPos = function( l1, l2, sp, r){
    var p1, p2, mu;
    var a = square(l2[0] - l1[0]) + square(l2[1] - l1[1]) + square(l2[2] - l1[2]);
    var b = 2.0 * ((l2[0] - l1[0]) * (l1[0] - sp[0]) +
                   (l2[1] - l1[1]) * (l1[1] - sp[1]) + 
                   (l2[2] - l1[2]) * (l1[2] - sp[2]));
    var c = (square(sp[0]) + square(sp[1]) + square(sp[2]) + square(l1[0]) +
              square(l1[1]) + square(l1[2]) -
              2 * (sp[0] * l1[0] + sp[1] * l1[1] + sp[2] * l1[2]) - square(r));
    var i = b * b - 4 * a * c;
    if (i < 0.0){
      return "no intersection";
    } else if (i === 0){
      var p = [1];
      mu = -b / (2*a);
      p1 = [
            l1[0] + mu * (l2[0] - l1[0]),
            l1[1] + mu * (l2[1] - l1[1]),
            l1[2] + mu * (l2[2] - l1[2]),
           ];
    } else if (i > 0){
      mu = (-b + Math.sqrt(i)) / (2 * a);
      p1 = [
            l1[0] + mu * (l2[0] - l1[0]),
            l1[1] + mu * (l2[1] - l1[1]),
            l1[2] + mu * (l2[2] - l1[2]),
           ];
      mu = (-b - Math.sqrt(i)) / (2 * a);
      p2 = [
            l1[0] + mu * (l2[0] - l1[0]),
            l1[1] + mu * (l2[1] - l1[1]),
            l1[2] + mu * (l2[2] - l1[2]),
           ];
    }
    return p1;
  };

  var sphereInterNeg = function( l1, l2, sp, r){
    var p1, p2, mu;
    var a = square(l2[0] - l1[0]) + square(l2[1] - l1[1]) + square(l2[2] - l1[2]);
    var b = 2.0 * ((l2[0] - l1[0]) * (l1[0] - sp[0]) +
                   (l2[1] - l1[1]) * (l1[1] - sp[1]) + 
                   (l2[2] - l1[2]) * (l1[2] - sp[2]));
    var c = (square(sp[0]) + square(sp[1]) + square(sp[2]) + square(l1[0]) +
              square(l1[1]) + square(l1[2]) -
              2 * (sp[0] * l1[0] + sp[1] * l1[1] + sp[2] * l1[2]) - square(r));
    var i = b * b - 4 * a * c;
    if (i < 0.0){
      return "no intersection";
    } else if (i === 0){
      var p = [1];
      mu = -b / (2*a);
      p1 = [
            l1[0] + mu * (l2[0] - l1[0]),
            l1[1] + mu * (l2[1] - l1[1]),
            l1[2] + mu * (l2[2] - l1[2]),
           ];
    } else if (i > 0){
      mu = (-b + Math.sqrt(i)) / (2 * a);
      p1 = [
            l1[0] + mu * (l2[0] - l1[0]),
            l1[1] + mu * (l2[1] - l1[1]),
            l1[2] + mu * (l2[2] - l1[2]),
           ];
      mu = (-b - Math.sqrt(i)) / (2 * a);
      p2 = [
            l1[0] + mu * (l2[0] - l1[0]),
            l1[1] + mu * (l2[1] - l1[1]),
            l1[2] + mu * (l2[2] - l1[2]),
           ];
    }
    return p2;
  };

  var rapAround1 = function (start, array, slope, rad, linetype){
    var line, rad, step, i, vector, vert, angle, unit;
    step =  0.0174532925;
    angle = -4.71238898;
    line = new linetype (slope, start);
    unit = [line.e[0] - line.o[0], line.e[1] - line.o[1], line.e[2] - line.o[2]]
    if(line.axis === 'x'){
      while(angle < 1.55334303){
        unit[0] = unit[2]*Math.cos(angle) - unit[0]*Math.sin(angle);
        unit[2] = unit[2]*Math.sin(angle) + unit[0]*Math.cos(angle);
        line.e = [-(unit[0] + line.o[0]), line.e[1], (unit[2] + line.o[2])]
        vert = sphereInterPos(line.o, line.e, sphere.c, rad.r);
        //console.log(vert);
        array.push(vert);
        angle += step;
      }
    } else if (line.axis === 'y'){
      while(angle < 1.55334303){
        unit[1] = unit[2]*Math.cos(angle) - unit[1]*Math.sin(angle);
        unit[2] = unit[2]*Math.sin(angle) + unit[1]*Math.cos(angle);
        line.e = [line.e[0], -(unit[1] + line.o[1]), (unit[2] + line.o[2])]
        vert = sphereInterPos(line.o, line.e, sphere.c, rad.r);
        //console.log(vert);
        array.push(vert);
        angle += step;
      }
    }
    return array;
  };
 
  var rapAround2 = function (start, array, slope, rad, linetype){
    var line, rad, step, i, vector, vert, angle, unit;
    step =  0.0174532925;
    angle = -4.71238898;
    line = new linetype (slope, start);
    unit = [line.e[0] - line.o[0], line.e[1] - line.o[1], line.e[2] - line.o[2]]
    if(line.axis === 'x'){
      while(angle < 1.55334303){
        unit[0] = unit[2]*Math.cos(angle) - unit[0]*Math.sin(angle);
        unit[2] = unit[2]*Math.sin(angle) + unit[0]*Math.cos(angle);
        line.e = [(unit[0] + line.o[0]), line.e[1], -(unit[2] + line.o[2])]
        vert = sphereInterPos(line.o, line.e, sphere.c, rad.r);
        //console.log(vert);
        array.push(vert);
        angle += step;
      }
    } else if(line.axis === 'y'){
      while(angle < 1.55334303){
        unit[1] = unit[2]*Math.cos(angle) - unit[1]*Math.sin(angle);
        unit[2] = unit[2]*Math.sin(angle) + unit[1]*Math.cos(angle);
        line.e = [line.e[0], (unit[1] + line.o[1]), -(unit[2] + line.o[2])]
        vert = sphereInterPos(line.o, line.e, sphere.c, rad.r);
        //console.log(vert);
        array.push(vert);
        angle += step;
      }
    }
    return array;
  };

  var sphereIntersectionPtsInner = function (slope, linetype1, linetype2){
    var radius = innerSphere.r, pt1Arr = [], pt2Arr = [], vert, line, step;
    step = (radius*7/15)/100
    for (var i = -(radius*7/15); i < radius*7/15; i += step){
      line = new linetype1 (slope, i);
      vert = sphereInterPos(line.o, line.e, sphere.c, innerSphere.r);
      pt1Arr.push(vert);
    }
    rapAround1(i, pt1Arr, slope, innerSphere, linetype1);
    for (var i = radius*7/15; i > -(radius*7/15); i -= step){
      line = new linetype2(slope, i);
      vert = sphereInterNeg(line.o, line.e, sphere.c, innerSphere.r);
      pt1Arr.push(vert);
    }
    rapAround2(i, pt1Arr, slope, innerSphere, linetype1);
    return pt1Arr;
  }
  var sphereIntersectionPts = function(slope, linetype1, linetype2){
    var radius = sphere.r, pt1Arr = [], pt2Arr = [], vert, line, step;
    step = (radius*7/15)/100;
    for (var i = -(radius*7/15); i < radius*7/15; i += step){
      line = new linetype1 (slope, i);
      vert = sphereInterPos(line.o, line.e, sphere.c, sphere.r);
      pt1Arr.push(vert);
    }
    rapAround1(i, pt1Arr, slope, sphere, linetype1);
    for (var i = radius*7/15; i > -(radius*7/15); i -= step){
      line = new linetype2 (slope, i);
      vert = sphereInterNeg(line.o, line.e, sphere.c, sphere.r);
      pt1Arr.push(vert);
    }
    rapAround2(i, pt1Arr, slope, sphere, linetype1);
    return pt1Arr;
  };

  var surfaceMaker = function(slope, linetype1, linetype2){
    var line1 = linetype1;
    var line2 = linetype2;
    var verts = [];
    var vert1 = sphereIntersectionPts(slope, line1, line2),
        vert2 = sphereIntersectionPtsInner(slope, line1, line2),
        i;
    for(i = 0; i < vert1.length; i ++){
      verts.push(vert1[i]);
      verts.push(vert2[i]);
    }
    return verts;
  };

  var Surface = function(slope, linetype1, linetype2){
    THREE.Geometry.call(this);

    var line1 = linetype1;
    var line2 = linetype2;
    var vert1 = sphereIntersectionPts(slope, line1, line2),
        vert2 = sphereIntersectionPtsInner(slope, line1, line2),
        i;
    for(i = 0; i < vert1.length; i ++){
      this.vertices.push(new THREE.Vector3(vert1[i][0], vert1[i][1], vert1[i][2]));
      this.vertices.push(new THREE.Vector3(vert2[i][0], vert2[i][1], vert2[i][2]));
    }
    for(i = 0; i < this.vertices.length - 2; i ++){
      this.faces.push(new THREE.Face3(i, i+1, i+2));
    }
  };
  Surface.prototype = Object.create(THREE.Geometry.prototype);
  Surface.prototype.constructor = Surface;

  var sphere = new Sphere(outerRadius);
  var innerSphere = new Sphere(innerRadius);

  this.surfaceV = [];
  this.surfaces = [];

  var lineCreate = function(numOf){
    var line, line2, line3, line4, surface, surface2, surface3, surface4, vector, angle,
    angleInc = 80/(numOf + 1);
    angle = angleInc;
    for (var i = 0; i < numOf-2; i ++){
      vector = toVector(Math.tan(angle*Math.PI/180));
      surface = surfaceMaker(vector, XLine, XLineNeg);
      surface2 = surfaceMaker(vector, XLineNeg, XLine);
      surface3 = new Surface(vector, XLine, XLineNeg);
      surface4 = new Surface(vector, XLineNeg, XLine);
      self.surfaceV.push(surface);
      self.surfaceV.push(surface2);
      self.surfaces.push(surface3);
      self.surfaces.push(surface4);
      angle += angleInc;
    }
  }

  lineCreate(number);
}
