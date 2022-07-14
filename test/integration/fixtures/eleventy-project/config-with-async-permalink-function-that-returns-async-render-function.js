const sass = require("../../../..");
const pluginRev = require("eleventy-plugin-rev");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginRev);
  eleventyConfig.addPlugin(sass, {
    compileOptions: {
      permalink: async function(permalinkString, inputPath) {
        return async (data) => {
          return data.page.filePathStem.replace(/\/stylesheets\//, "/css/") + ".css";
        };
      }
    },
    rev: true
  });
};
