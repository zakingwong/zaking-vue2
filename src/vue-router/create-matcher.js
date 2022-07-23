import createRouterMap from "./create-router-map";
export default function createMatcher(routes) {
  let { pathMap } = createRouterMap(routes);
  function addRoutes(routes) {
    createRouterMap(routes, pathMap);
  }
  function addRoute(route) {
    createRouterMap([route], pathMap);
  }
  function match(location) {
    return pathMap[location];
  }
  return {
    addRoutes,
    addRoute,
    match,
  };
}
