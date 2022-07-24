const debug = require("debug")("EleventySass");

let pluginClean;

let isEnabled = false;

let outputPathMap = new Map();

const clean = {
  get enabled() {
    return isEnabled;
  },
  set enabled(newValue) {
    debug(`clean.enabled = ${ newValue }`);
    if (newValue) {
      try {
        pluginClean = require("eleventy-plugin-clean");
      } catch(e) {
        console.error(red(`eleventy-sass failed to enable cleaning. ${ e }`));
        newValue = false;
      };
    } else {
      outputPathMap.clear();
    }
    isEnabled = newValue;
  },
  updateFileRecord: function(inputPath) {
    if (!isEnabled)
      return;

    let outputPath = outputPathMap.get(inputPath);
    if (outputPath)
      pluginClean.updateFileRecord(outputPath, inputPath);
  },
  createOrUpdateFileRecord(outputPath, inputPath) {
    if (!isEnabled)
      return;

    if (!outputPathMap.get(inputPath))
      pluginClean.updateFileRecord(outputPath, inputPath);
    outputPathMap.set(inputPath, outputPath);
  }
};

module.exports = clean;
