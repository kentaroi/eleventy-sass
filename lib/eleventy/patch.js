const TemplateRender = require("@11ty/eleventy/src/TemplateRender");

TemplateRender.prototype.getCompiledTemplateWithoutEleventySass =
  TemplateRender.prototype.getCompiledTemplate;

TemplateRender.prototype.getCompiledTemplate = function(str) {
  if (this.engineName === "sass" || this.engineName === "scss")
    return this.engine.compile(str, this.engineNameOrPath, !this.useMarkdown);

  return this.getCompiledTemplateWithoutEleventySass(str);
};


const CustomEngine = require("@11ty/eleventy/src/Engines/Custom");

CustomEngine.prototype.compileWithoutEleventySass = CustomEngine.prototype.compile;

CustomEngine.prototype.compileWithEleventySass = async function(str, inputPath, ...args) {
  await this._runningInit();
  let fn = this.entry.compile.bind({
    config: this.config
  })(str, inputPath, ...args);
  return fn;
};

CustomEngine.prototype.compile = function(str, inputPath, ...args) {
  if (this.name === "sass" || this.name === "scss") {
    return this.compileWithEleventySass(str, inputPath, ...args);
  }

  return this.compileWithoutEleventySass(str, inputPath, ...args);
};
