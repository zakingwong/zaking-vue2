export function forEachValue(obj, cb) {
  Object.keys(obj).forEach((key) => {
    cb(key, obj[key]);
  });
}
