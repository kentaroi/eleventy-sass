const path = require("node:path");
const eleventyEleventyCommonJsPath = require.resolve("@11ty/eleventy");
const eleventySrcPath = path.dirname(eleventyEleventyCommonJsPath);

const eleventyModulePath = function(...name) {
  return path.join(eleventySrcPath, ...name);
};

module.exports = eleventyModulePath;
