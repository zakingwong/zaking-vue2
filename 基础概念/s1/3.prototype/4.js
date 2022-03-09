var d = {
  d: 40,
};

var a = {
  x: 10,
  calc: function (z) {
    console.log(this.y);
    return this.x + this.y + this.d + z;
  },
  __proto__: d,
};

var b = {
  y: 20,
  __proto__: a,
};

var c = {
  y: 30,
  __proto__: a,
};

console.log(b.calc(30));
console.log(c.calc(30));
