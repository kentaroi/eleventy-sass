const debug = require("debug")("EleventySass:SourceMapStore");
const { red } = require("kleur");
const path = require('node:path');
const fs = require('fs');

const map = new Map();

const isValidSassFile = function(inputPath, content) {
  return (inputPath.endsWith(".sass") || inputPath.endsWith(".scss")) && content;
};

// This fix is needed because this plugin uses sass.compileString() instead of
// sass.compile() and the sourceMap.sources don't have the inputPath.
const fixSourceMap = function(inputPath, sourceMap) {
  let sources = sourceMap.sources.map(source => {
    if (source.startsWith("file://")) {
      return source;
    }
    return inputPath;
  });
  return Object.assign({}, sourceMap, { sources });
};

const sourceMapStatementFromInputPath = function(inputPath) {
  let filename = path.basename(inputPath, path.extname(inputPath)) + ".css.map";
  return `\n/*# sourceMappingURL=${ filename } */`;
};

module.exports = {
  set: function(inputPath, sourceMap) {
    let fixedSourceMap = fixSourceMap(inputPath, sourceMap);
    map.set(inputPath, fixedSourceMap);
    return sourceMapStatementFromInputPath(inputPath);
  },
  writer: function(content) {
    if (!isValidSassFile(this.inputPath, content)) {
      return content;
    }

    let sourceMap = map.get(this.inputPath);
    if (!sourceMap) {
      return content;
    }
    map.delete(this.inputPath);

    let sourceMapJSON = JSON.stringify(sourceMap);
    if (!sourceMapJSON) {
      return content;
    }

    let dir = path.dirname(this.outputPath);
    try {
      let stats = fs.statSync(dir);
      if (stats.isFile()) {
        console.error(red(`[eleventy-sass] Failed to write sourcemap for ${ this.inputPath }, because ${ dir } is a file.`));
        return content;
      }
    } catch(e) {
      if (e.code == "ENOENT") {
        fs.mkdirSync(dir, { recursive: true });
        debug(`${ dir } created..`);
      } else {
        throw(e);
      }
    }

    let sourceMapPath = this.outputPath + ".map";
    fs.writeFile(sourceMapPath, sourceMapJSON, err => {
      if (err) {
        console.error(red(`[eleventy-sass] Failed to write sourcemap (${ sourceMapPath }) for ${ this.inputPath }. Error: ${ err }`));
      } else {
        debug(`${ sourceMapPath } written..`);
      }
    });
    return content;
  }
};
