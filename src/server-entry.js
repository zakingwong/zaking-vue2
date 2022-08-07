import createApp from "./app";

export default (context) => {
  return new Promise((resolve, reject) => {
    const { app, router, store } = createApp();
    router.push(context.url);
    router.onReady(() => {
      const matchComponents = router.getMatchedComponents();
      if (matchComponents.length > 0) {
        Promise.all(
          matchComponents.map((component) => {
            if (component.asyncData) {
              return component.asyncData(store);
            }
          })
        ).then(() => {
          context.state = store.state;
          resolve(app);
        }, reject);
      } else {
        reject({ code: 404, msg: "No Components Matched" });
      }
    }, reject);
  });
};
