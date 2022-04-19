const strats = {};
const LIFECYCLE = ["beforeCreate", "created"];
LIFECYCLE.forEach((hook) => {
  strats[hook] = function (p, c) {
    if (c) {
      if (p) {
        return p.concat(c);
      } else {
        return [c];
      }
    } else {
      return p;
    }
  };
});

strats.components = function (parentValue, childValue) {
  const res = Object.create(parentValue);
  if (childValue) {
    for (const key in childValue) {
      res[key] = childValue[key];
    }
  }
  return res;
};

export function mergeOptions(parent, child) {
  const options = {};
  for (let key in parent) {
    mergeField(key);
  }
  for (let key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key);
    }
  }

  function mergeField(key) {
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key]);
    } else {
      options[key] = child[key] || parent[key];
    }
  }
  return options;
}
