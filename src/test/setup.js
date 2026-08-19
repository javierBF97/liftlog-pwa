import '@testing-library/jest-dom';

// Node.js 25 exposes a native but non-functional localStorage (an empty object
// with no methods). Vitest's jsdom populateGlobal uses simple assignment and
// cannot override the native getter. We replace it with a proper in-memory
// implementation via defineProperty so tests that rely on localStorage work.
function createLocalStorageMock() {
  let store = {};
  return {
    get length() {
      return Object.keys(store).length;
    },
    key(index) {
      return Object.keys(store)[index] ?? null;
    },
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key, value) {
      store[String(key)] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
}

Object.defineProperty(globalThis, 'localStorage', {
  value: createLocalStorageMock(),
  configurable: true,
  writable: true,
});
