const isActive = require("./is-active");

const normalizeUserOptions = function(rawUserOptions) {
  if (rawUserOptions == undefined) {
    return [];
  }

  if (rawUserOptions instanceof Array) {
    return rawUserOptions;
  }

  if (typeof rawUserOptions !== "object") {
    throw TypeError("Options for eleventy-sass plugin must be of type Object or Array");
  }

  return [rawUserOptions];
};


const parseOptions = function(defaultOptionsArray, rawUserOptions, envForTesting) {
  let userOptionsArray = normalizeUserOptions(rawUserOptions);
  let optionsArray = [...defaultOptionsArray, ...userOptionsArray]
    .filter(options => isActive(options.when, envForTesting));

  let compileOptionsArray = optionsArray.map(options => options.compileOptions)
    .filter(co => co);
  let compileOptions = Object.assign({}, ...compileOptionsArray);

  let sassOptionsArray = optionsArray.map(options => options.sass)
    .filter(so => so);
  let sassOptions = Object.assign({}, ...sassOptionsArray);

  let extensionOptionsArray = optionsArray.map(options => {
    let { compileOptions, sass, when, ...optionsToUse } = options;
    return optionsToUse;
  });

  let { postcss, rev, ...options } = Object.keys(compileOptions).length === 0
    ? Object.assign({}, ...extensionOptionsArray)
    : Object.assign({}, ...extensionOptionsArray, { compileOptions });

  return { options, sassOptions, postcss, rev };
};

module.exports = parseOptions;
