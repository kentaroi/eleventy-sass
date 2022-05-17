const debug = require("debug")("EleventySass");
const debugDev = require("debug")("Dev:EleventySass");

const sass = require("sass");
const path = require("path");
const url = require("url");

const DependencyMap = require("./dependency-map");
const sourceMapStore = require("./source-map-store");

let depMap = new DependencyMap();
let cacheKeys = new Map();

let isProduction;
const initIsProduction = function(defaultEnv) {
  let env = process.env.ELEVENTY_ENV ?? defaultEnv;
  if (env == null) {
    isProduction = true;
    return;
  }
  isProduction = "production".startsWith(env.toLowerCase());
};

const compileOptionsDefaults = {
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
};

const pluginSassDefaults = {
  style: (isProduction ? 'compressed' : 'expanded'),
  sourceMap: !isProduction,
  sourceMapIncludeSources: true
};

const includePathsFromIncludes = function(config, includes) {
  let input = config.dir.input;
  if (typeof includes === 'string') {
    return includes.split(",").map(e => path.join(input, e.trim()));
  } else if (includes instanceof Array) {
    return includes.map(e => path.join(input, e));
  }
  return [];
};

// If user supplies loadPaths or includes, this method will normalize and return them,
// otherwise will return an array containing `config.dir.includes` directory.
// All of the above returning arrays contain currentDir.
const getLoadPaths = function(currentDir, config, loadPaths, includes) {
  let paths = [];
  if (loadPaths || includes) {
    if (loadPaths) {
      paths.push(...loadPaths);
    }
    if (includes) {
      let includePaths = includePathsFromIncludes(config, includes);
      paths.push(...includePaths);
    }
  } else if (config.dir.includes) {
    paths.push(...includePathsFromIncludes(config, config.dir.includes));
  }
  paths.unshift(currentDir);
  return paths;
};

// This fix is needed because this plugin uses sass.compileString() instead of
// sass.compile() and the sourceMap.sources don't have the inputPath.
const fixSourceMap = function(inputPath, sourceMap) {
  let sources = sourceMap.sources.map(source => {
    if (source.startsWith("file://")) {
      return source;
    }
    return url.pathToFileURL(path.resolve(inputPath)).href;
  });
  return Object.assign({}, sourceMap, { sources });
};

module.exports = function(eleventyConfig, userOptions = {}) {
  initIsProduction(userOptions.defaultEleventyEnv);
  let {sass: sassOptions, defaultEleventyEnv, postcss, ...options} = userOptions;
  const pluginSassOptions = Object.assign({}, pluginSassDefaults, sassOptions);

  let compileOptions = Object.assign({}, compileOptionsDefaults, options.compileOptions);
  const extensionOptions = Object.assign({
    outputFileExtension: "css",
    getData: async function(inputPath) {
      return {
        eleventyComputed: {
          layout: false
        }
      };
    },
    compile: async function(inputContent, inputPath) {
      let parsed = path.parse(inputPath);
      if (parsed.name.startsWith("_")) {
        debugDev(`Actually, didn't compile ${ inputPath }, because the filename starts with "_"`);
        return () => undefined;
      }

      let loadPaths = getLoadPaths(parsed.dir, this.config, pluginSassOptions.loadPaths, pluginSassOptions.includes);
      let {includes, ...stringOptions} =
        Object.assign({}, pluginSassOptions, { loadPaths });

      // Must use sass.compileString() here. If you used sass.compile(),
      // sass would touch the file and Eleventy would compile it twice.
      let result = sass.compileString(inputContent, stringOptions);
      let css = result.css;
      let sourceMap = result.sourceMap ? fixSourceMap(inputPath, result.sourceMap) : null;
      if (postcss) {
        let postprocessed;
        if (sourceMap) {
          postprocessed = await postcss.process(css, { map: {prev: sourceMap}});
          sourceMap = postprocessed.map;
        } else {
          postprocessed = await postcss.process(css, { map: false });
        }
        css = postprocessed.css;
      }
      let sourceMapStatement = sourceMap ? sourceMapStore.set(inputPath, sourceMap) : "";
      debugDev(`Has compiled ${ inputPath }`);

      let dependant = path.normalize(inputPath);
      let loadedPaths = result.loadedUrls.map(loadedUrl => path.relative('.', url.fileURLToPath(loadedUrl)));
      depMap.update(dependant, loadedPaths);

      return async (data) => {
        return css + sourceMapStatement;
      };
    },
    isIncrementalMatch: function(incrementalFile) {
      let testingPath = path.normalize(this.inputPath);
      let changedPath = path.normalize(incrementalFile);
      if (testingPath === changedPath) {
        return true;
      }
      return depMap.hasDependency(testingPath, changedPath);
    }
  }, options, { compileOptions });

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
