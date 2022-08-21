require("./lib/eleventy/patch");
const eleventySass = require("./lib/eleventy-sass");

const plugin = {
  configFunction: eleventySass,
  name: "eleventy-sass"
};

module.exports = plugin;
