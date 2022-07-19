const { posix: path } = require("path");


const preprocessLoadPaths = function(loadPaths) {
  if (loadPaths instanceof Array) {
    return loadPaths;
  } else if (typeof loadPaths === "string") {
    return loadPaths.split(",").map(loadPath => loadPath.trim());
  } else {
    return [];
  }
};

const includePathsFromIncludes = function(inputDir, includes) {
  if (typeof includes === 'string') {
    return includes.split(",").map(e => path.join(inputDir, e.trim()));
  } else if (includes instanceof Array) {
    return includes.map(e => path.join(inputDir, e));
  }
  return [];
};

const getLoadPaths = function(currentDir, config, loadPaths, includes) {

  let paths = loadPaths ? preprocessLoadPaths(loadPaths) : [];

  if (includes) {
    let includePaths = includePathsFromIncludes(config.dir.input, includes);
    paths.push(...includePaths);
  } else if (includes === false) {
    // NO includes
  } else if (config.dir.includes) {
    paths.push(...includePathsFromIncludes(config.dir.input, config.dir.includes));
  }

  paths.unshift(currentDir);

  return paths;
};

const getLoadPathsFixedSassOptions = function(sassOptions, dir, config) {
  let loadPaths = getLoadPaths(dir, config, sassOptions.loadPaths, sassOptions.includes);
  let { includes, ...options } = Object.assign({}, sassOptions, { loadPaths });
  return options;
};

module.exports = getLoadPathsFixedSassOptions;
