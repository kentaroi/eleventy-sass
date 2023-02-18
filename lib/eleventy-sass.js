const { posix: path } = require("path");

const { red, yellow } = require("kleur");
let pluginRev;
try {
  pluginRev = require("eleventy-plugin-rev");
} catch { }

const parseOptions = require("./parse-options");
const compile = require("./compile");
const sourceMapStore = require("./source-map-store");
const hasPlugin = require("./has-plugin");
const clean = require("./clean");

const debug = require("debug")("EleventySass");
const debugDev = require("debug")("Dev:EleventySass");


let compileCache = new Map();

const defaultOptions = [
  {
    compileOptions: {
      cache: true
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

  let { options, sassOptions, postcss, rev } = parseOptions(defaultOptions, userOptions);

  clean.enabled = sassOptions.sourceMap && hasPlugin(eleventyConfig, "eleventy-plugin-clean");

  if (pluginRev) {
    [".sass", ".scss"].forEach(ext => pluginRev.settings.setEnabled(ext, rev));
  } else if (rev) {
    console.error(red("rev is enabled, but failed to load eleventy-plugin-rev package."));
    rev = false;
  }


  const compileWithCache = async function(inputContent, inputPath, bypass) {
    if (bypass)
      return () => inputContent;

    let cache = compileCache.get(inputPath);
    if (cache !== undefined) {
      if (cache === null)
        return undefined;

      return () => cache;
    }

    let css = await compile.call(this, inputContent, inputPath, sassOptions, this.config, postcss);
    if (css === undefined) {
      compileCache.set(inputPath, null);
      return undefined;
    }

    compileCache.set(inputPath, css);

    return async (data) => {
      return css;
    };
  };

  const compileWithoutCache = async function(inputContent, inputPath, bypass) {
    if (bypass)
      return () => inputContent;

    let css = await compile.call(this, inputContent, inputPath, sassOptions, this.config, postcss);
    if (css === undefined)
      return undefined;

    return async (data) => {
      return css;
    };
  };

  const retrieveRevHash = async function(inputPath, template) {
    let normalizedInputPath = path.normalize(inputPath);
    let revHash = pluginRev.revHashFromInputPath(normalizedInputPath);
    if (revHash === undefined) {
      let css = compileCache.get(inputPath);
      if (css === undefined) {
        let inputContent = await template.inputContent;
        let context = {
          addDependencies: (from, toArray = []) => {
            template.config.uses.addDependency(from, toArray);
          }
        };
        css = await compile.call(context, inputContent, inputPath, sassOptions, template.config, postcss);
        if (css === undefined)
          css = null;
        compileCache.set(inputPath, css);
      }
      if (typeof css === "string") {
        revHash = pluginRev.createRevHash(normalizedInputPath, css);
      } else {
        pluginRev.registerRevHash(normalizedInputPath, "");
        revHash = "";
      }
    }
    return revHash;
  };

  if (rev) {
    let eleventySassRevvedPermalink;
    if (options.compileOptions?.permalink !== undefined) {
      let originalPermalink = options.compileOptions.permalink;
      eleventySassRevvedPermalink = async function(permalinkString, inputPath, template) {
        let render;
        if (typeof originalPermalink === "function") {
          let mixins = Object.assign({}, template.config.javascriptFunctions);
          render = await originalPermalink.call(mixins, permalinkString, inputPath);
        } else {
          render = originalPermalink;
        }

        let revHash;
        if (render !== false)
          revHash = await retrieveRevHash(inputPath, template);

        return async function(data) {
          let location = typeof render === "function" ? await render(data) : render;

          if (location === "raw" || location === undefined) {
            location = data.page.filePathStem + "." + data.page.outputFileExtension;
          } else if (typeof location === "string") {
            // Do nothing
          } else if (location === false) {
            return false;
          } else {
            throw Error(`Unexpected permalink: ${ location }`);
          }

          location = path.normalize(location);
          if (location[0] !== "/") {
            location = "/" + location;
          }

          pluginRev.setPathPair(path.normalize(inputPath), location);
          return pluginRev.revvedFilePath(location, revHash);
        };
      };
    } else { // No user-defined permalink
      eleventySassRevvedPermalink = async function(permalinkString, inputPath, template) {
        let revHash = await retrieveRevHash(inputPath, template);

        return (data) => {
          // location has no revHash, ie. the original Location.
          let location = data.page.filePathStem + "." + data.page.outputFileExtension;
          pluginRev.setPathPair(path.normalize(inputPath), location);

          return data.page.filePathStem + "-" + revHash + "." + data.page.outputFileExtension;
        };
      };
      if (!options.compileOptions) {
        options.compileOptions = {};
      }
    }
    options.compileOptions.permalink = eleventySassRevvedPermalink;

    const TemplateContent = require("@11ty/eleventy/src/TemplateContent");
    if (TemplateContent.prototype._renderFunctionWithoutEleventySassFix === undefined)
      TemplateContent.prototype._renderFunctionWithoutEleventySassFix =
        TemplateContent.prototype._renderFunction;

    // The above rewritten permalink function needs `this` (Template object),
    // because the plugin needs inputContent and config to compile a Sass/SCSS
    // file, and it needs the compiled content to generate a revision hash for
    // the result CSS filename. (TemplateContent is the superclass of Template)
    //
    // The reason why it just needs to pass `this` (Template object) and
    // no needs to call read() or getInputContent() is because Eleventy always
    // calls read() before calling _renderFunction().
    // TemplateWriter
    //   write() -> generateTemplates() ->
    //   _createTemplateMap() -> _addToTemplateMap() ->
    //                             TemplateMap
    //                               add() ->
    //                             Template
    //                               getTemplateMapEntries() -> getData() ->
    //                             TemplateContent
    //                               getFrontMatterData() -> read() ***
    //                        -> TemplateMap
    //                               cache() -> initDependencyMap() ->
    //                           Template
    //                               getTemplates() -> addComputedData() ->
    //                               getOutputHref() -> _getLink() -> _renderFunction()
    TemplateContent.prototype._renderFunction = async function(fn, ...args) {
      let result;
      if (fn.name === "eleventySassRevvedPermalink") {
        result = await fn(...args, this);
      } else {
        let mixins = Object.assign({}, this.config.javascriptFunctions);
        result = await fn.call(mixins, ...args);
      }

      // normalize Buffer away if returned from permalink
      if (Buffer.isBuffer(result)) {
        return result.toString();
      }

      return result;
    };
  } else {
    const TemplateContent = require("@11ty/eleventy/src/TemplateContent");
    if (TemplateContent.prototype._renderFunctionWithoutEleventySassFix) {
      TemplateContent.prototype._renderFunction =
        TemplateContent.prototype._renderFunctionWithoutEleventySassFix;
      delete TemplateContent.prototype._renderFunctionWithoutEleventySassFix;
    }
  }

  const extensionOptions = Object.assign({
    outputFileExtension: "css",
    getData: async function(inputPath) {
      return {
        eleventyComputed: {
          layout: false,
          eleventyExcludeFromCollections: true
        }
      };
    },
    compile: rev ? compileWithCache : compileWithoutCache
  }, options);

  const fileExtensions = ['sass', 'scss'];
  fileExtensions.forEach(fileExtension => {
    if (!eleventyConfig.templateFormatsAdded?.includes(fileExtension))
      eleventyConfig.addTemplateFormats([fileExtension]);
    eleventyConfig.addExtension(fileExtension, extensionOptions);
  });

  eleventyConfig.addTransform("eleventy-sass:source-map-writer", sourceMapStore.writer);

  eleventyConfig.on("eleventy.before", () => {
    compileCache.clear();
  });
}

module.exports = eleventySass;
