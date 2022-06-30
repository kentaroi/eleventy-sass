const path = require("path");
const url = require("url");

const sass = require("sass");
const { red, yellow } = require("kleur");

const parseOptions = require("./parse-options");
const DependencyMap = require("./dependency-map");
const sourceMapStore = require("./source-map-store");
const fixSourceMap = require("./fix-source-map");
const getLoadPathsFixedSassOptions = require("./get-load-paths-fixed-sass-options");

const debug = require("debug")("EleventySass");
const debugDev = require("debug")("Dev:EleventySass");


let depMap = new DependencyMap();
let cacheKeys = new Map();

const fileURLToPath = fileURL => path.relative(".", url.fileURLToPath(fileURL));

const defaultOptions = [
  {
    compileOptions: {
      cache: true,
      getCacheKey: function(contents, inputPath) {
        let normalizedPath = path.normalize(inputPath);
        let key = cacheKeys.get(normalizedPath);
        if (key) {
          debugDev(`getCacheKey(contents, ${ inputPath }) -> ${ key }`);
          return key;
        }
        let newKey = normalizedPath + (new Date().toISOString()) + 'initial';
        cacheKeys.set(normalizedPath, newKey);
        debugDev(`getCacheKey(contents, ${ inputPath }) -> ${ newKey }`);
        return newKey;
      }
    },
    sass: {
      style: "expanded",
      sourceMap: true,
      sourceMapIncludeSources: true
    }
  }, {
    sass: {
      style: "compressed",
      sourceMap: false,
    },
    when: { "ELEVENTY_ENV": env => env === undefined || "production".startsWith(env) }
  }
];

const eleventySass = function(eleventyConfig, userOptions = {}) {

  if (userOptions.defaultEleventyEnv) {
    console.error(red("`defaultEleventyEnv` is deprecated since version 2.0.0."));
    console.warn(yellow("For details, see:\nhttps://github.com/kentaroi/eleventy-sass/blob/main/README.md#options\n"));
    throw Error("`defaultEleventyEnv` is deprecated since version 2.0.0.");
  }

  const { options, sassOptions, postcss } = parseOptions(defaultOptions, userOptions);

  const compile = async function(inputContent, inputPath) {
    let parsed = path.parse(inputPath);
    if (parsed.name.startsWith("_")) {
      debugDev(`Actually, didn't compile ${ inputPath }, because the filename starts with "_"`);
      return () => undefined;
    }

    const stringOptions = getLoadPathsFixedSassOptions(sassOptions, parsed.dir, this.config);

    if (parsed.ext === ".sass") {
      stringOptions.syntax = "indented";
    }

    // Must use sass.compileString() here. If you used sass.compile(),
    // sass would touch the file and Eleventy would compile it twice.
    let result = sass.compileString(inputContent, stringOptions);
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

    let dependant = path.normalize(inputPath);
    let loadedPaths = result.loadedUrls.map(fileURLToPath);
    depMap.update(dependant, loadedPaths);

    return async (data) => {
      return css;
    };
  };

  const extensionOptions = Object.assign({
    outputFileExtension: "css",
    getData: async function(inputPath) {
      return {
        eleventyComputed: {
          layout: false
        }
      };
    },
    compile: compile,
    isIncrementalMatch: function(incrementalFile) {
      let testingPath = path.normalize(this.inputPath);
      let changedPath = path.normalize(incrementalFile);
      if (testingPath === changedPath) {
        return true;
      }
      return depMap.hasDependency(testingPath, changedPath);
    }
  }, options);

  const fileExtensions = ['sass', 'scss'];
  eleventyConfig.addTemplateFormats(fileExtensions);
  fileExtensions.forEach(fileExtension => {
    eleventyConfig.addExtension(fileExtension, extensionOptions);
  });

  eleventyConfig.addTransform("eleventy-sass:source-map-writer", sourceMapStore.writer);

  eleventyConfig.on("eleventy.beforeWatch", function(queue) {
    debugDev("eleventy.beforeWatch queue: %O", queue);
    let key = new Date().toISOString();
    for (let inputPath of queue) {
      let normalizedPath = path.normalize(inputPath);
      cacheKeys.set(normalizedPath, normalizedPath + key);
      let dependants = depMap.dependantsOf(normalizedPath)
      for (let dependant of dependants) {
        cacheKeys.set(dependant, dependant + key);
      }
    }
  });
}

module.exports = eleventySass;
