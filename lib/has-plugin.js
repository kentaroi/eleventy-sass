const hasPlugin = function(eleventyConfig, name) {
  for (let plugin of eleventyConfig.plugins) {
    if (plugin.plugin.name === name)
      return true;
  }
  return false;
};

module.exports = hasPlugin;
