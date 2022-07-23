export default function createRouterMap(routes, pathsMap) {
  let pathMap = pathsMap || {};
  routes.forEach((route) => {
    addRouteRecord(route, pathMap);
  });
  return {
    pathMap,
  };
}
function addRouteRecord(route, pathMap, parentRecord) {
  let path = parentRecord
    ? `${parentRecord.path === "/" ? "/" : `${parentRecord.path}/`}${
        route.path
      }`
    : route.path;
  let record = {
    path,
    component: route.component,
    parent: parentRecord,
  };
  if (!pathMap[path]) {
    pathMap[path] = record;
  }
  route.children &&
    route.children.forEach((childRoute) => {
      addRouteRecord(childRoute, pathMap, record);
    });
}
