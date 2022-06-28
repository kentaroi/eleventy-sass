const path = require("path");

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
// All of the above returning arrays contain currentDir at index 0.
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

const getLoadPathsFixedSassOptions = function(sassOptions, dir, config) {
  let loadPaths = getLoadPaths(dir, config, sassOptions.loadPaths, sassOptions.includes);
  let { includes, ...options } = Object.assign({}, sassOptions, { loadPaths });
  return options;
};

module.exports = getLoadPathsFixedSassOptions;
