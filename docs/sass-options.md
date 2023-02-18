# Sass options

```javascript
// .eleventy.js
const sass = require("eleventy-sass");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(sass, {
    sass: {
      style: "expanded",
      sourceMap: true,
      loadPaths: ["node_modules/bootstrap/scss"],
      includes: "_includes/stylesheets"
    }
  });
};
```

You can set sass options to `sass` property like the above code.


The sass options are passed to [a dart-sass API function](https://sass-lang.com/documentation/js-api/modules#compileString) `sass.compileString()`. For details, please read [the Sass documentation](https://sass-lang.com/documentation/js-api/modules#StringOptions).

However, before passing it to `sass.compileString()`, [eleventy-sass](https://github.com/kentaroi/eleventy-sass) reads `includes` property and merge it into `loadPaths` property.


## `loadPaths` and `includes` properties
First of all, `loadPaths` and `includes` are NOT for teaching Eleventy where your Sass/SCSS files are, but for informing [dart-sass library](https://github.com/sass/dart-sass) how to load other Sass/SCSS files from a Sass/SCSS file by using `@use`, `@forward` or `@import` rules.

Therefore, if you do not use Sass/SCSS files in other npm packages, you may not have to use these properties.

Suppose you neither set value to `loadPaths` nor `includes`, and you have the following:

```bash
├── .eleventy.js
├── _includes
│   └── tag-cloud.scss
├── index.md
└── scss
    ├── style.scss
    └── themes
        └── _gruvbox.scss
```

You can load `_gruvbox.scss` from `style.scss` with `@use "themes/gruvbox";`, because the directory of the processing file (`style.scss`) is automatically added to the `loadPaths` by the plugin.

You can also load `tag-cloud.scss` from `style.scss` with `@use "tag-cloud";`, because your project's [includes](https://www.11ty.dev/docs/config/#directory-for-includes) directory (`_includes`) is automatically added to the `loadPaths` by the plugin if you do not set anything to the `includes` property in `sass` options.


### When to use `loadPaths` and `includes`
Both of `loadPaths` and `includes` properties can be used for specifying `loadPaths` option for `sass.compileString()`.

#### `loadPaths` is useful for loading Sass/SCSS files in other packages
When you want to use Sass/SCSS files in another npm package, you can set the package directory to `loadPaths`.

For example, you can load [bootstrap](https://github.com/twbs/bootstrap)'s SCSS file with `@import "bootstrap";` by the following `.eleventy.js` settings:
```javascript
// .eleventy.js
const sass = require("eleventy-sass");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(sass, {
    sass: {
      loadPaths: ["node_modules/bootstrap/scss"],
    }
  });
};
```

#### `includes` is useful for nested includes directory
When you have the following:

```bash
├── .eleventy.js
├── _includes
│   ├── stylesheets
│       └── tag-cloud.scss
└── scss
    └── style.scss
```
You can load `tag-cloud.scss` from `style.scss` with `@use "stylesheets/tag-cloud";` by default, but if you set `includes` property as follows:

```javascript
// .eleventy.js
const sass = require("eleventy-sass");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(sass, {
    sass: {
      includes: "_includes/stylesheets"
    }
  });
};
```
You can load `tag-cloud.scss` from `style.scss` with `@use "tag-cloud";`.


### `loadPaths` property
The value for `loadPaths` should be of type `Array` or `String`. If you set a string, it will be split by "," before processing.

The value should be relative path(s) from your project root.

### `includes` property
The value for `includes` should be of type `Array` or `String` or `false`. If you set a string, it will be split by "," before processing.

The value should be relative path(s) from [input](https://www.11ty.dev/docs/config/#input-directory) directory of your project. The default value is [includes](https://www.11ty.dev/docs/config/#directory-for-includes) directory of your project and it will be removed or replaced if you set any value to the `includes` property.

If you set `false` to `includes` property, the plugin simply removes [includes](https://www.11ty.dev/docs/config/#directory-for-includes) directory from `loadPaths`.

### ⚠️  eleventy-sass 1.x
The plugin changed the way to use `loadPaths` and `includes` properties from 2.0. Here is how 1.x used those properties:

If you did not set either `loadPaths` property or `includes` property, the `loadPaths` for `sass.compileString()` would be your project's [includes](https://www.11ty.dev/docs/config/#directory-for-includes) directory.

However, if you set `loadPaths` property and/or `includes` property, you project's [includes](https://www.11ty.dev/docs/config/#directory-for-includes) directory wouldn't be included in the `loadPaths` for `sass.compileString()`.

`loadPaths` property didn't accept `String` type.
