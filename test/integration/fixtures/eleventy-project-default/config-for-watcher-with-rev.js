const sass = require("../../../..");
const pluginRev = require("eleventy-plugin-rev");

console.log(`Eleventy PID: ${ process.pid }`);

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginRev);
  eleventyConfig.addPlugin(sass, {
    rev: true
  });
};
