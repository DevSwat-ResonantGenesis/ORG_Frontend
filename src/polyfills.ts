// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hasOwn = (obj: any, prop: PropertyKey) => Object.prototype.hasOwnProperty.call(obj, prop);

// Object.hasOwn is not available in older Chromium builds (e.g., react-snap puppeteer).
// Provide a minimal polyfill so prerendering can execute the bundle.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof (Object as any).hasOwn !== 'function') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Object as any).hasOwn = hasOwn;
}
