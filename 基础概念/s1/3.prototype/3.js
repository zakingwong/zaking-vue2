String.prototype.equals = function (o) {
  // "use strict";
  console.log(typeof o);
  console.log(typeof this);
  return this === o;
};

var a = "a";
console.log(a.equals(a));
