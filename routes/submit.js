exports.Ball = function (innerRadius, outerRadius, number, thick) {
    if(typeof number === 'string'){
      number = parseInt(number);
    }
    if(typeof innerRadius === 'string'){
      innerRadius = parseInt(innerRadius);
    }
    if(typeof outerRadius === 'string'){
      outerRadius = parseInt(outerRadius);
    }
    if(typeof thick === 'string'){
      thick = parseFloat(thick);
    }
    var self = this;
    this.faces = [];
    this.vertices = [];
    this.obj = '';
    //mathmatical geometry classes
    var Sphere = function(radius){
      this.c = [0,0,0];
      this.r = radius;
    };

    var XLine = function(slope, xCoord){
      this.axis = 'x';
      this.o = [xCoord, thick/2, 0];
      this.e = [xCoord, slope[0] + thick/2, slope[1]];
    };

    var XLineLow = function(slope, xCoord){
      this.axis = 'x';
      this.o = [xCoord, -thick/2, 0];
      this.e = [xCoord, slope[0]-thick/2, slope[1]-thick]; 
    };

    var XLineNeg = function(slope, zCoord){
      this.axis = 'x';
      this.o = [zCoord, thick/2, 0];
      this.e = [zCoord, -slope[0] + thick/2, slope[1]];
    };

    var XLineNegLow = function(slope, zCoord){
      this.axis = 'x';
      this.o = [zCoord, -thick/2, 0];
      this.e = [zCoord, -slope[0] - thick/2, slope[1]];
    };

    var YLine = function(slope, yCoord){
      this.axis = 'y';
      this.o = [thick/2, yCoord, 0];
      this.e = [slope[0] + thick/2, yCoord, slope[1]];
    };

    var YLineLow = function(slope, yCoord){
      this.axis = 'y';
      this.o = [-thick/2, yCoord, 0];
      this.e = [slope[0] - thick/2, yCoord, slope[1]];
    };

    var YLineNeg = function(slope, yCoord){
      this.axis = 'y';
      this.o = [thick/2, yCoord, 0];
      this.e = [-slope[0] + thick/2, yCoord, slope[1]];
    };

    var YLineNegLow = function(slope, yCoord){
      this.axis = 'y';
      this.o = [-thick/2, yCoord, 0];
      this.e = [-slope[0] - thick/2, yCoord, slope[1]];
    };
  //converts radians to 2d vectors. should find  better way

    var makeMeanOBJ = function (vertices, faces) {
      var s = '';
      for (i = 0; i < vertices.length; i++) {
          s+= 'v '+ vertices[i][0] + ' ' +
          vertices[i][1] + ' '+
          vertices[i][2] + '\n';
      }
      for (i = 0; i < faces.length; i++) {
          s+= 'f '+ (faces[i][0]+1) + ' ' +
          (faces[i][1]+1) + ' '+
          (faces[i][2]+1);

          if (faces[i][3] !== undefined) {
              s+= ' '+ (faces[i][3]+1);
          }
          s+= '\n';
      }
      return s;
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
    //the two functions below calculate the the vertices
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
  //these two function rotate the line for calculating the vertice to connect the pieces together
    var rapAround1 = function (start, array, slope, rad, linetype){
      var line, rad, step, i, vector, vert, angle, unit;
      step =  0.0174532925;
      angle = -4.71238898;
      line = new linetype (slope, start);
      unit = [line.e[0] - line.o[0], line.e[1] - line.o[1], line.e[2] - line.o[2]]
      if(line.axis === 'x'){
        while(angle < 1.5334303){
          unit[0] = unit[2]*Math.cos(angle) - unit[0]*Math.sin(angle);
          unit[2] = unit[2]*Math.sin(angle) + unit[0]*Math.cos(angle);
          line.e = [-(unit[0] + line.o[0]), line.e[1], (unit[2] + line.o[2])]
          vert = sphereInterPos(line.o, line.e, sphere.c, rad.r);
          array.push(vert);
          angle += step;
        }
      } else if (line.axis === 'y'){
        while(angle < 1.53334303){
          unit[1] = unit[2]*Math.cos(angle) - unit[1]*Math.sin(angle);
          unit[2] = unit[2]*Math.sin(angle) + unit[1]*Math.cos(angle);
          line.e = [line.e[0], -(unit[1] + line.o[1]), (unit[2] + line.o[2])]
          vert = sphereInterPos(line.o, line.e, sphere.c, rad.r);
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
        while(angle < 1.58334303){
          unit[0] = unit[2]*Math.cos(angle) - unit[0]*Math.sin(angle);
          unit[2] = unit[2]*Math.sin(angle) + unit[0]*Math.cos(angle);
          line.e = [(unit[0] + line.o[0]), line.e[1], -(unit[2] + line.o[2])]
          vert = sphereInterPos(line.o, line.e, sphere.c, rad.r);
          array.push(vert);
          angle += step;
        }
      } else if(line.axis === 'y'){
        while(angle < 1.58334303){
          unit[1] = unit[2]*Math.cos(angle) - unit[1]*Math.sin(angle);
          unit[2] = unit[2]*Math.sin(angle) + unit[1]*Math.cos(angle);
          line.e = [line.e[0], (unit[1] + line.o[1]), -(unit[2] + line.o[2])]
          vert = sphereInterPos(line.o, line.e, sphere.c, rad.r);
          array.push(vert);
          angle += step;
        }
      }
      return array;
    };
  //two below iterate along the a given axis and calcuate verts,
    var sphereIntersectionPtsInner = function (slope, linetype1, linetype2){
      var radius = innerSphere.r, pt1Arr = [], pt2Arr = [], vert, line, step;
      step = (radius*7/15)/100;
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
    };

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
  //main surface class
    var Surface = function(slope, linetype1, linetype2, linetype3, linetype4){

      var line1 = linetype1;
      var line2 = linetype2;
      var line3 = linetype3;
      var line4 = linetype4;


      var init = function (slope){
        var vert1 = sphereIntersectionPts(slope, line1, line2),
            vert2 = sphereIntersectionPtsInner(slope, line1, line2),
            vert3 = sphereIntersectionPts(slope, line3, line4),
            vert4 = sphereIntersectionPtsInner(slope, line3, line4),
            length = self.vertices.length,
            add, a,
            i;
        for(i = 0; i < vert1.length; i ++){
          self.vertices.push(vert1[i]);
          self.vertices.push(vert2[i]);
          self.vertices.push(vert3[i]);
          self.vertices.push(vert4[i]);
        }
        for(a = length; a < self.vertices.length-7; a += 4){
          self.faces.push([a+1, a, a+5]);
          self.faces.push([a+5, a+1, a+3]);
          self.faces.push([a+3, a+5, a+7]);
          self.faces.push([a+7, a+3, a+2]);
          self.faces.push([a+2, a+7, a+6]);
          self.faces.push([a+6, a+2, a]);
          self.faces.push([a, a+6, a+4]);
          self.faces.push([a, a+5, a+4]);
        }
        self.faces.push([a+1, a, length + 1]);
        self.faces.push([length +1, a+1, a+3]);
        self.faces.push([a+3, length + 1, length + 3]);
        self.faces.push([length + 2, a+3, a+2]);
        self.faces.push([a+2, length + 3, length + 2]);
        self.faces.push([length + 2, a+2, a]);
        self.faces.push([a, length + 2, length + 0]);
        self.faces.push([a, length + 1, length + 0]);
      };
      init(slope);
    };
  //class for axial pieces
    var FlatRing = function (axis){
      
      var twoPi = Math.PI * 2,
          i, a,
          outRad = sphere.r,
          inRad = innerSphere.r,
          length = self.vertices.length,
          add,
          ver = 500,
          x1, y1, x2, y2;
      for(i = 0; i <= ver; i ++){
        rad = i/ver;
        x1 = outRad * Math.cos(rad * twoPi);
        y1 = outRad * Math.sin(rad * twoPi);
        x2 = inRad * Math.cos(rad * twoPi);
        y2 = inRad * Math.sin(rad * twoPi);
        if(axis === 'x'){
          self.vertices.push([x1, thick/2, y1]);
          self.vertices.push([x2, thick/2, y2]);
          self.vertices.push([x1, -thick/2, y1]);
          self.vertices.push([x2, -thick/2, y2]);
        } else if (axis === 'y'){
          self.vertices.push([thick/2, x1, y1]);
          self.vertices.push([thick/2, x2, y2]);
          self.vertices.push([-thick/2, x1, y1]);
          self.vertices.push([-thick/2, x2, y2]);
        }
      }
      for(a = length; a < self.vertices.length-7; a +=4){
        self.faces.push([a+1, a, a+5]);
        self.faces.push([a+5, a+1, a+3]);
        self.faces.push([a+3, a+5, a+7]);
        self.faces.push([a+7, a+3, a+2]);
        self.faces.push([a+2, a+7, a+6]);
        self.faces.push([a+6, a+2, a]);
        self.faces.push([a, a+6, a+4]);
        self.faces.push([a, a+5, a+4]);
      }
      self.faces.push([a+1, a, length + 1]);
      self.faces.push([length +1, a+1, a+3]);
      self.faces.push([a+3, length + 1, length + 3]);
      self.faces.push([length + 2, a+3, a+2]);
      self.faces.push([a+2, length + 3, length + 2]);
      self.faces.push([length + 2, a+2, a]);
      self.faces.push([a, length + 2, length + 0]);
      self.faces.push([a, length + 1, length + 0]);
    };

    var sphere = new Sphere(outerRadius);
    var innerSphere = new Sphere(innerRadius);

    var init = function(numOf){
      var line, line2, line3, line4, surface, surface2, surface3, surface4, vector, angle,
      angleInc = 75/(numOf + 1);
      angle = angleInc;
      for (var i = 0; i < numOf-2; i ++){
        vector = toVector(Math.tan(angle*Math.PI/180));
        Surface(vector, XLine, XLineNeg, XLineLow, XLineNegLow);
        Surface(vector, XLineNeg, XLine, XLineNegLow, XLineLow);
        Surface(vector, YLine, YLineNeg, YLineLow, YLineNegLow);
        Surface(vector, YLineNeg, YLine, YLineNegLow, YLineLow);
        angle += angleInc;
      }
      FlatRing('x');
      FlatRing('y');
      self.obj = makeMeanOBJ(self.vertices, self.faces);
      console.log(self.obj);
    };

    init(number);
};