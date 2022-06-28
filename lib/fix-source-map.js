const path = require("path");
const url = require("url");

// This fix is needed because the plugin uses sass.compileString() instead of
// sass.compile() and the sourceMap.sources don't have the inputPath URL.
const fixSourceMap = function(inputPath, sourceMap) {
  let sources = sourceMap.sources.map(source => {
    if (source.startsWith("file://")) {
      return source;
    }
    return url.pathToFileURL(path.resolve(inputPath)).href;
  });
  return Object.assign({}, sourceMap, { sources });
};

module.exports = fixSourceMap;
