# eleventy-sass

[![npm](https://img.shields.io/npm/v/eleventy-sass)](https://www.npmjs.com/package/eleventy-sass)
[![npm peer dependency version](https://img.shields.io/npm/dependency-version/eleventy-sass/peer/@11ty/eleventy)](https://github.com/11ty/eleventy)
[![CI](https://github.com/kentaroi/eleventy-sass/workflows/CI/badge.svg?branch=main)](https://github.com/kentaroi/eleventy-sass/actions?query=branch%3Amain+workflow%3ACI)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/kentaroi/eleventy-sass/blob/main/LICENSE)

Yet another Sass/SCSS plugin for [Eleventy](https://www.11ty.dev/).

Source maps, PostCSS and revision hashes are supported.

## Why another Sass plugin?

There are several [Eleventy plugins](https://www.npmjs.com/search?q=keywords%3Aeleventy-plugin%20sass) to support Sass/SCSS files, already.
Even the official Eleventy website has [a page](https://www.11ty.dev/docs/languages/custom/#example-add-sass-support-to-eleventy) which describes how to handle Sass/SCSS files with your [Eleventy](https://www.11ty.dev/) project.

I created the plugin, because I was not satisfied with the above solutions, for example:

- The existing plugins did watch Sass/SCSS files and write CSS files by themselves or by using another toolkit, such as gulp.js, instead of using [Eleventy](https://www.11ty.dev/)'s file watching and writing functionality. They might work well, but doesn't seem to be integrated enough with Eleventy.

- [The page in the official Docs](https://www.11ty.dev/docs/languages/custom/#example-add-sass-support-to-eleventy) is great if you only have Sass/SCSS files which do not have `@use` or `@forward` rules.<br />
If you use `@use` in your Sass/SCSS files, for example, and you change a dependency Sass/SCSS file, [Eleventy](https://www.11ty.dev/) will compile it (if its filename doesn't start with "\_"), but won't compile the dependant Sass/SCSS files, if you are following the instructions in [the page of the official Docs](https://www.11ty.dev/docs/languages/custom/#example-add-sass-support-to-eleventy).

In contrast to the existing solutions, [eleventy-sass](https://github.com/kentaroi/eleventy-sass) manages dependencies between Sass/SCSS files and makes maximum use of Eleventy's functionality. It is highly configurable, but it just works if you add it in your Eleventy config file.

For those of you who are curious about how [eleventy-sass](https://github.com/kentaroi/eleventy-sass) handles Sass/SCSS files, [here is a brief explanation](#how-eleventy-sass-handles-sassscss-files).

## Installation
```shell
npm install eleventy-sass
```

## Usage
Open up your Eleventy config file (probably `.eleventy.js`) and use `addPlugin()`:

```javascript
const eleventySass = require("eleventy-sass");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(eleventySass);
};
```
That's it. Only the above code in your `.eleventy.js`, your Sass/SCSS files will be compiled to CSS and written in your `output` directory.

### Default behavior
Suppose your have the following `.eleventy.js`. In this example, your [input directory](https://www.11ty.dev/docs/config/#input-directory) is "src" and your [output directory](https://www.11ty.dev/docs/config/#output-directory) is "dist" since it seems to be widely used settings in Eleventy community.

```javascript
const eleventySass = require("eleventy-sass");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(eleventySass);

  return { dir: { input: "src", output: "dist" } };
};
```

and execute `npx @11ty/eleventy` or `npx @11ty/eleventy --serve` from your shell, you will get the following:
```bash
├── .eleventy.js
├── dist
│   ├── index.html
│   └── stylesheets
│       ├── accessibility
│       │   └── large-style.css
│       └── style.css
├── package-lock.json
├── package.json
└── src
    ├── _includes
    │   └── tag-cloud.scss
    ├── index.md
    └── stylesheets
        ├── accessibility
        │   └── large-style.scss
        ├── style.scss
        └── themes
            └── _gruvbox.scss
```
As you can see, your Sass/SCSS files in your [input](https://www.11ty.dev/docs/config/#input-directory) ("src") directory, no matter how deep they are, were compiled and written in your [output](https://www.11ty.dev/docs/config/#output-directory) ("dist") directory unless they are in [includes](https://www.11ty.dev/docs/config/#directory-for-includes) ("\_includes") directory or their filenames start with "\_".

Files in [includes](https://www.11ty.dev/docs/config/#directory-for-includes) directory and files whose filenames start with "\_" are not compiled directly but can be used from the other Sass/SCSS files with `@use` and `@forward` rules.

For example, `_gruvbox.scss` file in the above example can be loaded from `style.scss` file with `@use "themes/gruvbox";`, and `tag-cloud.scss` file can be loaded from `style.scss` file with `@use "tag-cloud";`. (The reason you don't have to specify it with `@use "../_includes/tag-cloud";` is that [includes](https://www.11ty.dev/docs/config/#directory-for-includes) ("\_includes") directory is the default `loadPaths` for [eleventy-sass](https://github.com/kentaroi/eleventy-sass). I will describe `loadPaths` in [Sass options](https://github.com/kentaroi/eleventy-sass/blob/main/docs/sass-options.md).)

## For Windows users
Command samples in this documentation suppose Linux/macOS environments.

```bash
ELEVENTY_ENV=development npx @11ty/eleventy
```
Please replace, for example, the above command with the following:

```
set ELEVENTY_ENV=development & npx @11ty/eleventy
```
in `cmd.exe` or

```
$env:ELEVENTY_ENV="development"; npx @11ty/eleventy
```
in `PowerShell`.

## Options
[eleventy-sass](https://github.com/kentaroi/eleventy-sass) allows you to customize the behavior by options like follows:

```javascript
// .eleventy.js
const eleventySass = require("eleventy-sass");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(eleventySass, {
    compileOptions: {
      permalink: function(contents, inputPath) {
        return (data) => data.page.filePathStem.replace(/^\/scss\//, "/css/") + ".css";
      }
    },
    sass: {
      style: "compressed",
      sourceMap: false
    },
    rev: true
  });
};
```
Options can be of type Object or Array.

### Options object
Let's talk about passing an object as options first.

Basically, `options` you pass as the second argument for `addPlugin()` is used for options for `eleventyConfig.addExtension()`, which [eleventy-sass](https://github.com/kentaroi/eleventy-sass) calls internally. The full options list is [provided in the official Docs](https://www.11ty.dev/docs/languages/custom/#full-options-list).

However, there are exceptions. Four properties, which are `sass`, `postcss`, `rev` and `when`, are not used for options for `eleventyConfig.addExtension()` but used for other purposes.

#### `sass` property
`sass` property is used for options for `sass.compileString()`, [a dart-sass API function](https://sass-lang.com/documentation/js-api/modules#compileString), which [eleventy-sass](https://github.com/kentaroi/eleventy-sass) calls internally. For details, please read [Sass options](https://github.com/kentaroi/eleventy-sass/blob/main/docs/sass-options.md) and [the Sass documentation](https://sass-lang.com/documentation/js-api/modules#StringOptions).


#### `postcss` property
You can set [PostCSS](https://github.com/postcss/postcss) object to `postcss` property, and [eleventy-sass](https://github.com/kentaroi/eleventy-sass) automatically apply the [PostCSS](https://github.com/postcss/postcss) object to the compiled CSS files.

```javascript
// .eleventy.js
const eleventySass = require("eleventy-sass");
const postcss = require("postcss");
const rtlcss = require("rtlcss");
const cssnano = require("cssnano");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(eleventySass, {
    postcss: postcss([rtlcss, cssnano])
  });
};
```

#### `rev` property
If you want to add revision hashes to the compiled CSS filenames, you can set `true` to `rev` property and add [eleventy-plugin-rev](https://github.com/kentaroi/eleventy-plugin-rev) as follows:

```bash
npm install eleventy-plugin-rev
```

```javascript
// .eleventy.js
const pluginRev = require("eleventy-plugin-rev");
const eleventySass = require("eleventy-sass");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginRev);
  eleventyConfig.addPlugin(eleventySass, {
    rev: true
  });
};
```

You can use filter functions, `rev` and `revvedOutput`, to add revision hashes.

Suppose you have the following project ([input directory](https://www.11ty.dev/docs/config/#input-directory) is `src` and [output directory](https://www.11ty.dev/docs/config/#output-directory) is `dist`):
```bash
.
├── .eleventy.js
├── dist
│   ├── blog
│   │   └── eleventy-quick-tips/index.html
│   ├── css
│   │   └── style-42df228b.css
│   └── index.html
└── src
    ├── index.md
    ├── blog
    │   └── eleventy-quick-tips.md
    └── scss
        └── style.scss
```

The link tag to your CSS file will be the following:
```html
<link rel="stylesheet" href="/css/style-42df228b.css" />
```

By using filters, you can write the above link tag as follows:
```liquid
<link rel="stylesheet" href="{{ "/css/style.css" | rev }}" />
```

```liquid
<link rel="stylesheet" href="{{ "/scss/style.scss" | revvedOutput }}" />
```
⚠️  The paths for the `rev` and `revvedOutput` filters must be relative from the [output](https://www.11ty.dev/docs/config/#output-directory) and [input](https://www.11ty.dev/docs/config/#input-directory) directories respectively and must be prefixed with `/`, or a relative path from the current file.

For example, from `eleventy-quick-tips.md` file, you can also write the link tag as follows:
```liquid
<link rel="stylesheet" href="{{ "../../css/style.css" | rev }}" />
```

```liquid
<link rel="stylesheet" href="{{ "../scss/style.scss" | revvedOutput }}" />
```

⚠️  `inputToRevvedOutput` filter will be deprecated. (Input paths for `inputToRevvedOutput` must be relative paths from your project root, even if your [input directory](https://www.11ty.dev/docs/config/#input-directory) is not your project root.)

#### `when` property
`when` property is a special property, which is used for enabling or disabling the options object by environment/shell variables. For details, see [when options](https://github.com/kentaroi/eleventy-sass/blob/main/docs/when-options.md). 

### Options array
You can set an array of objects to the second argument of `addPlugin()` to configure `eleventy-sass` with a finer granularity.

In this case, each element of the array is an [options object](#options-object).

First, [eleventy-sass](https://github.com/kentaroi/eleventy-sass) concatenates [the default options](#default-options) and user-defined options.

I didn't write about it in the above [Options object](#options-object) section, but even if you set an object as options, the plugin concatenates [the default options](#default-options) and the user-defined options object(s) and the following process is exactly the same.

Elements of the array are options objects, and each object is enabled or disabled by its `when` property. If the evaluation of the `when` property is false, an options object will be disabled.

After the evaluations, `eleventy-sass` merges all of the enabled options of the array, which was created from [default options](#default-options) objects and user-defined options objects,  and create a final options object.

When merging, elements at greater indexes can overwrite elements at smaller indexes. So, the default options are weakest and the last element of a user-defined options array is the strongest, and the default options can be overwritten by user-defined options.

Therefore, in general, general options should be placed at smaller indexes and more specific (conditional) options should be placed at greater indexes.

Let's take a look at an example:

```javascript
// .eleventy.js
const eleventySass = require("eleventy-sass");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(eleventySass, [
    {
      compileOptions: {
        permalink: function(permalinkString, inputPath) {
          return (data) => {
            return data.page.filePathStem.replace(/^\/scss\//, "/css/") + ".css";
          };
        }
      },
      sass: {
        style: "expanded",
        sourceMap: true
      }
    }, {
      rev: true,
      when: { ELEVENTY_ENV: "stage" }
    }, {
      sass: {
        style: "compressed",
        sourceMap: false
      },
      rev: true,
      when: [ { ELEVENTY_ENV: "production" }, { ELEVENTY_ENV: false } ]
    }
  ]);
};
```

The first element defines `permalink`, `style` and `sourceMap`, and it should be applied in whichever environments because there is no `when` property.

The second element defines `rev`, and it should be applied only when `ELEVENTY_ENV` environment/shell variable is `stage`.

The last element defines `style`, `sourceMap` and `rev`, and it should be applied when `ELEVENTY_ENV` is `production` or `ELEVENTY_ENV` is not defined (or `ELEVENTY_ENV` is an empty string).

Therefore, when you run `ELEVENTY_ENV=development npx @11ty/eleventy --serve` in Linux/macOS terminal for example, the result CSS files have source maps and expanded style (because of the first options object), but their filenames do not have revision hashes, because the second and the third options objects are disabled.

When you run `ELEVENTY_ENV=stage npx @11ty/eleventy --serve`, the result CSS files have source maps and expanded style (because of the first options object), and their filenames have revision hashes (because of the second options object).

When you run  `npx @11ty/eleventy --serve` (if `ELEVENTY_ENV` is not defined in `.bashrc`, `.zshrc`, etc.), `ELEVENTY_ENV=production npx @11ty/eleventy --serve` or `ELEVENTY_ENV= npx @11ty/eleventy --serve`, the result CSS files do not have source maps and have compressed style and their filenames have revision hashes (because of the last options object).

### Default options
If you do not specify any options, [eleventy-sass](https://github.com/kentaroi/eleventy-sass) uses the default options.

```javascript
// Default options
[
  {
    compileOptions: {
      cache: true,
    },
    sass: {
      includes: [/* The includes directory of your Eleventy project */],
      style: "expended",
      sourceMap: true,
      sourceMapIncludeSources: true
    }
  }, {
    sass: {
      style: "compressed",
      sourceMap: false
    },
    when: { ELEVENTY_ENV: (env) => env === undefined || "production".startsWith(env) }
  }
]
```

The above is the default options. In short, they say [eleventy-sass](https://github.com/kentaroi/eleventy-sass) writes minified (compressed) CSS files without source maps if `ELEVENTY_ENV` environment/shell variable is `production` or not set, otherwise writes readable (expanded) CSS files with source maps.

For example, if you add the following line in your `.bash_profile`, `.bashrc`, `.zshrc`, etc. on your local PC,
```bash
export ELEVENTY_ENV=development
```
the environment is `development` locally, and the result CSS files will have readable style and source maps, because the second element of the default options is disabled and the only first options object is applied.

On the other hand, you will have CSS files with compressed style and without source maps, for example, in [GitHub Actions](https://github.com/features/actions) by default, because there is no `ELEVENTY_ENV` environment variable and the second element of the default options is enabled.

And, of course, you can specify an environment from your shell prompt like this:
```bash
ELEVENTY_ENV=production npx @11ty/eleventy --serve
```

### Some recipes
#### How to change output directory for CSS files compiled from Sass/SCSS
For example, you have Sass/SCSS files in `scss` directory in your `input` directory. To output CSS files in `css` directory in your `output` directory, you can write a permalink function like this:

```javascript
const eleventySass = require("eleventy-sass");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(eleventySass, {
    compileOptions: {
      permalink: function(contents, inputPath) {
        return (data) => {
          return data.page.filePathStem.replace(/^\/scss\//, "/css/") + ".css";
        };
      }
    }
  });
};
```
For details, please refer to the [compileOptions.permalink](https://www.11ty.dev/docs/languages/custom/#compileoptions.permalink-to-override-permalink-compilation) section in the official documentation.

#### How to use PostCSS and Autoprefixer to add vender prefixes
Install [PostCSS](https://github.com/postcss/postcss) and [Autoprefixer](https://github.com/postcss/autoprefixer)
```bash
npm install postcss autoprefixer
```

Configure your `.eleventy.js` as follows:
```javascript
const eleventySass = require("eleventy-sass");
const postcss = require("postcss");
const autoprefixer = require("autoprefixer");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(eleventySass, {
    postcss: postcss([autoprefixer])
  });
};
```

Edit your `package.json`, for example:
```json5
{
  // ...
  "browserslist": [
    "last 1 chrome version",
    "last 1 firefox version",
    "last 1 safari version",
    "last 1 ie version"
  ]
  // ...
}
```

See [Autoprefixer](https://github.com/postcss/autoprefixer) and [Browserslist](https://github.com/browserslist/browserslist) for more details.

## Debug mode
You can see verbose outputs by using `DEBUG` environment/shell variable (cf. [DEBUG MODE](https://www.11ty.dev/docs/debugging/)).

```bash
DEBUG=Eleventy* npx @11ty/eleventy
```

If you want to see only the [eleventy-sass](https://github.com/kentaroi/eleventy-sass)'s verbose outputs, change the value for `DEBUG` environment/shell variable like this:

```bash
DEBUG=EleventySass* npx @11ty/eleventy
```

or, if you prefer more verbose outputs, like this:
```bash
DEBUG=*EleventySass* npx @11ty/eleventy
```

## How [eleventy-sass](https://github.com/kentaroi/eleventy-sass) handles Sass/SCSS files
[Eleventy](https://www.11ty.dev/) watches files.

When [Eleventy](https://www.11ty.dev/) detects a file update, it emits an `eleventy.beforeWatch` event, and [eleventy-sass](https://github.com/kentaroi/eleventy-sass) will receive the event and check if the file is a Sass/SCSS file.

If the file is a Sass/SCSS file, [eleventy-sass](https://github.com/kentaroi/eleventy-sass) changes the cache keys for the updated file and its dependant Sass/SCSS files, which invalidates the cached CSSes, so that [Eleventy](https://www.11ty.dev/) will compile all of the files affected.

When compiling Sass/SCSS files, [Eleventy](https://www.11ty.dev/) calls `compile` function of the [eleventy-sass](https://github.com/kentaroi/eleventy-sass).

The `compile` function of [eleventy-sass](https://github.com/kentaroi/eleventy-sass) will compile Sass/SCSS files if they don't start with "\_".

The actual compilation is done by [sass](https://www.npmjs.com/package/sass), which is [dart-sass](https://github.com/sass/dart-sass).

By using the result of the compilation from [dart-sass](https://github.com/sass/dart-sass), [eleventy-sass](https://github.com/kentaroi/eleventy-sass) not only returns the compiled CSS, but also, if necessary, writes its source map file and updates the dependency map, which [eleventy-sass](https://github.com/kentaroi/eleventy-sass) has internally and uses for invalidating cached CSSes of dependant files as described above.
