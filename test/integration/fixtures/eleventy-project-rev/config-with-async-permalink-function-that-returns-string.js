const sass = require("../../../..");
const pluginRev = require("eleventy-plugin-rev");
const { posix: path } = require("path");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginRev);
  eleventyConfig.addPlugin(sass, {
    compileOptions: {
      permalink: async function(permalinkString, inputPath) {
        return path.format({
          dir: "css",
          name: path.basename(inputPath, path.extname(inputPath)),
          ext: ".css"
        });
      }
    },
    rev: true
  });
};
