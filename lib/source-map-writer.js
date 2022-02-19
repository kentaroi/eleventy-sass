const debug = require("debug")("EleventySass:SourceMapWriter");
const path = require('node:path');
const fs = require('fs');

// This fix is needed because this plugin uses sass.compileString() instead of sass.compile() and
// sourceMap.sources don't have the name of the main Sass/SCSS file.
const fixSourceMap = function(sourceMap, inputPath) {
  let sources = sourceMap.sources.map(source => {
    if (source.startsWith("file://")) {
      return source;
    }
    return inputPath;
  });
  return Object.assign({}, sourceMap, { sources });
};

module.exports = {
  write: function(config, inputPath, sourceMap) {
    let parsed = path.parse(inputPath);
    let filename = parsed.name + '.css.map';
    let fixedSourceMap = fixSourceMap(sourceMap, inputPath);
    let outputPath = path.join(config.dir.output, path.relative(config.dir.input, parsed.dir), filename);
    fs.writeFile(outputPath, JSON.stringify(fixedSourceMap), err => {
      if (err) {
        console.log(`[eleventy-sass] Failed to write sourcemap (${ outputPath }). Error: ${ err }`);
      } else {
        debug(`${ outputPath } written..`);
      }
    });
    console.log(`[eleventy-sass] Writing ${ outputPath } from ${ inputPath }`);
    return `\n/*# sourceMappingURL=${ filename } */`;
  }
};
