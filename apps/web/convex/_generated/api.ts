/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Stub file — replaced by Convex codegen when you run `npx convex dev`.
 * Exists so the project builds before Convex is initialized.
 */
const proxyHandler: ProxyHandler<object> = {
  get: (_target, prop) =>
    new Proxy(
      {},
      {
        get: (_t2, fn) => `${String(prop)}.${String(fn)}`,
      },
    ),
};

export const api: any = new Proxy(
  {},
  {
    get: (_target, prop) =>
      new Proxy(
        {},
        {
          get: (_t2, fn) => `${String(prop)}.${String(fn)}`,
        },
      ),
  },
);

export const internal: any = new Proxy({}, proxyHandler);
