const path = require("path");
const url = require("url");

const sass = require("sass");

let dependencyMap = require("./dependency-map");
const sourceMapStore = require("./source-map-store");
const getLoadPathsFixedSassOptions = require("./get-load-paths-fixed-sass-options");

const debugDev = require("debug")("Dev:EleventySass:Compile");

let PathNormalizer;
try {
  PathNormalizer = require("@11ty/eleventy/src/Util/PathNormalizer");
} catch { }
const fileURLToPath = PathNormalizer
                    ? fileURL => PathNormalizer.normalizeSeperator(path.relative(".", url.fileURLToPath(fileURL)))
                    : fileURL => path.relative(".", url.fileURLToPath(fileURL));

// inputPath should be normalized before calling compile
const compile = async function(inputContent, inputPath, sassOptions, config, postcss) {
  let parsed = path.posix.parse(inputPath);
  if (parsed.name.startsWith("_")) {
    debugDev(`Actually, didn't compile ${ inputPath }, because the filename starts with "_"`);
    return;
  }

  let inputURL = url.pathToFileURL(path.posix.resolve(inputPath)).href;

  let stringOptions = getLoadPathsFixedSassOptions(sassOptions, parsed.dir, config);
  stringOptions.url = inputURL;

  if (parsed.ext === ".sass") {
    stringOptions.syntax = "indented";
  }

  // Must use sass.compileString() here. If you used sass.compile(),
  // sass would touch the file and Eleventy would compile it twice.
  let { css, sourceMap, loadedUrls } =
    sass.compileString(inputContent, stringOptions);

  if (postcss) {
    let postprocessed;
    if (sourceMap) {
      postprocessed = await postcss.process(css, { map: { prev: sourceMap }, from: inputURL });
      sourceMap = postprocessed.map;
    } else {
      postprocessed = await postcss.process(css, { map: false, from: inputURL });
    }
    css = postprocessed.css;
  }
  if (sourceMap) {
    css += sourceMapStore.set(inputPath, sourceMap);
  }
  debugDev(`Has compiled ${ inputPath }`);

  let loadedPaths = loadedUrls.map(fileURLToPath);
  dependencyMap.update(inputPath, loadedPaths);

  return css;
};

module.exports = compile;
