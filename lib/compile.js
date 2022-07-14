const path = require("path");
const url = require("url");

const sass = require("sass");

let dependencyMap = require("./dependency-map");
const sourceMapStore = require("./source-map-store");
const fixSourceMap = require("./fix-source-map");
const getLoadPathsFixedSassOptions = require("./get-load-paths-fixed-sass-options");

const debugDev = require("debug")("Dev:EleventySass:Compile");

const fileURLToPath = fileURL => path.relative(".", url.fileURLToPath(fileURL));

// inputPath should be normalized before calling compile
const compile = async function(inputContent, inputPath, sassOptions, config, postcss) {
  let parsed = path.parse(inputPath);
  if (parsed.name.startsWith("_")) {
    debugDev(`Actually, didn't compile ${ inputPath }, because the filename starts with "_"`);
    return;
  }

  const stringOptions = getLoadPathsFixedSassOptions(sassOptions, parsed.dir, config);

  if (parsed.ext === ".sass") {
    stringOptions.syntax = "indented";
  }

  // Must use sass.compileString() here. If you used sass.compile(),
  // sass would touch the file and Eleventy would compile it twice.
  const result = sass.compileString(inputContent, stringOptions);
  let css = result.css;
  let sourceMap = result.sourceMap ? fixSourceMap(inputPath, result.sourceMap) : null;
  if (postcss) {
    let postprocessed;
    if (sourceMap) {
      postprocessed = await postcss.process(css, { map: { prev: sourceMap } });
      sourceMap = postprocessed.map;
    } else {
      postprocessed = await postcss.process(css, { map: false });
    }
    css = postprocessed.css;
  }
  if (sourceMap) {
    css += sourceMapStore.set(inputPath, sourceMap);
  }
  debugDev(`Has compiled ${ inputPath }`);

  let loadedPaths = result.loadedUrls.map(fileURLToPath);
  dependencyMap.update(inputPath, loadedPaths);

  return css;
};

module.exports = compile;
