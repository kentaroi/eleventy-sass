let eleventySass;

try {
  require("@11ty/eleventy/src/GlobalDependencyMap");
  require("./lib/eleventy/patch");
  eleventySass = require("./lib/eleventy-sass");
} catch {
  require("./lib/eleventy/patch-for-2.0.0-canary.18-and-below");
  eleventySass = require("./lib/eleventy-sass-for-2.0.0-canary.18-and-below");
}

const plugin = {
  configFunction: eleventySass,
  name: "eleventy-sass"
};

module.exports = plugin;
