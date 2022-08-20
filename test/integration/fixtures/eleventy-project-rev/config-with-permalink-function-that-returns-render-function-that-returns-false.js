const sass = require("../../../..");
const pluginRev = require("eleventy-plugin-rev");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginRev);
  eleventyConfig.addPlugin(sass, {
    compileOptions: {
      permalink: function(permalinkString, inputPath) {
        return () => false;
      }
    },
    rev: true
  });
};
