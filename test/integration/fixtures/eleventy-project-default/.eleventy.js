const sass = require("../../../..");

console.log(`Eleventy PID: ${ process.pid }`);

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(sass);
};
