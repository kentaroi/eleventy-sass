const eleventyModulePath = require("../eleventy-module-path");
const templateRenderPath = eleventyModulePath("TemplateRender");
const TemplateRender = require(templateRenderPath).default;

TemplateRender.prototype.getCompiledTemplateWithoutEleventySass =
  TemplateRender.prototype.getCompiledTemplate;

TemplateRender.prototype.getCompiledTemplate = function(str) {
  if (this.engineName === "sass" || this.engineName === "scss")
    return this.engine.compile(str, this.engineNameOrPath, !this.useMarkdown);

  return this.getCompiledTemplateWithoutEleventySass(str);
};


const customEnginePath = eleventyModulePath("Engines", "Custom");
const CustomEngine = require(customEnginePath).default;

CustomEngine.prototype.compileWithoutEleventySass = CustomEngine.prototype.compile;

CustomEngine.prototype.compileWithEleventySass = async function(str, inputPath, ...args) {
  await this._runningInit();
  let fn = this.entry.compile.bind({
    config: this.config,
    addDependencies: (from, toArray = []) => {
      this.config.uses.addDependency(from, toArray);
    }
  })(str, inputPath, ...args);
  return fn;
};

CustomEngine.prototype.compile = function(str, inputPath, ...args) {
  if (this.name === "sass" || this.name === "scss") {
    return this.compileWithEleventySass(str, inputPath, ...args);
  }

  return this.compileWithoutEleventySass(str, inputPath, ...args);
};
