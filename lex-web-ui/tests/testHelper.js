/* eslint no-console: ["error", { allow: ["warn", "error", "info"] }] */
// Utility function for deep merging objects
export const deepMerge = (target, source) => {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] instanceof Object && key in target) {
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
};
   