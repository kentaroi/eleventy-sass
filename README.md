# [eleventy-sass](https://www.npmjs.com/package/eleventy-sass)

Yet another Sass/SCSS plugin for [Eleventy](https://www.11ty.dev/).

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

## Options
[eleventy-sass](https://github.com/kentaroi/eleventy-sass) allows you to customize the behavior by options.

```javascript
const eleventySass = require("eleventy-sass");
module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(eleventySass, {
    sass: {
      loadPaths: ["src/_includes"],
      style: "expanded",
      sourceMap: true,
      sourceMapIncludeSources: true
    }
  });
};
```

Basically, `options` you pass as the second argument for `addPlugin()` is used for options for `eleventyConfig.addExtension()`, which [eleventy-sass](https://github.com/kentaroi/eleventy-sass) calls internally. The full options list is [provided in the official doc](https://www.11ty.dev/docs/languages/custom/#full-options-list).

However, the value for `sass` key is used for options for `sass.compileString()`, [a dart-sass API function](https://sass-lang.com/documentation/js-api/modules#compileString), which also [elventy-sass](https://github.com/kentaroi/eleventy-sass) calls internally. For details, please read [the Sass documentation](https://sass-lang.com/documentation/js-api/modules#StringOptions).

You can use `includes` key insted of `loadPaths` key in this `sass` options, for convenience. The value for `includes` key should be of type Array or String and relative to the `input` directory.

For example, when your `input` directory is the project root,
```javascript
// the following code:
eleventyConfig.addPlugin(eleventySass, {
  sass: {
    includes: "_includes/stylesheets"
  }
});

// is equivalent to:
eleventyConfig.addPlugin(eleventySass, {
  sass: {
    loadPaths: ["_includes/stylesheets"]
  }
});
```

But, when your `input` directory is `src`,
```javascript
// the following code:
eleventyConfig.addPlugin(eleventySass, {
  sass: {
    includes: "_includes/stylesheets"
  }
});

// is equivalent to:
eleventyConfig.addPlugin(eleventySass, {
  sass: {
    loadPaths: ["src/_includes/stylesheets"]
  }
});
```

The value of `includes` should be of type Array or String.
```javascript
// The following:
eleventyConfig.addPlugin(eleventySass, {
  sass: {
    includes: "_includes/stylesheets, _some/other/directory"
  }
});

// is equivalent to:
eleventyConfig.addPlugin(eleventySass, {
  sass: {
    includes: ["_includes/stylesheets", "_some/other/directory"]
  }
});
```

### Default options
If you do not specify any options, [eleventy-sass](https://github.com/kentaroi/eleventy-sass) uses the default options. By default, [eleventy-sass](https://github.com/kentaroi/eleventy-sass) sees `ELEVENTY_ENV` environment/shell variable, and if it is "production", "prod", "p", or something like that or if there is no `ELEVENTY_ENV` variable, it considers the environment `production`.

```javascript
// If the environment is production, the default options are:
{
  sass: {
    loadPaths: [/* The includes directory of your Eleventy project */],
    style: "compressed",
    sourceMap: false,
    sourceMapIncludeSources: true
  }
}

// If not, the default options are:
{
  sass: {
    loadPaths: [/* The includes directory of your Eleventy project */],
    style: "expanded",
    sourceMap: true,
    sourceMapIncludeSources: true
  }
}
```

Therefore, for example, if you add the following line in your `.bash_profile`, `.bashrc`, `.zshrc`, etc.,
```bash
export ELEVENTY_ENV=development
```
the environment is `development` locally, and you have a `production` environment, for example, in [GitHub Actions](https://github.com/features/actions) by default, because [eleventy-sass](https://github.com/kentaroi/eleventy-sass) regards no `ELEVENTY_ENV` variable as `production`.

And, of course, you can specify an environment from the your shell like this:
```bash
$ ELEVENTY_ENV=production npx @11ty/eleventy --serve
```

## Why?

There are several [Eleventy plugins](https://www.npmjs.com/search?q=keywords%3Aeleventy-plugin%20sass) to support Sass/SCSS files, already.
Even the official Eleventy website has [a page](https://www.11ty.dev/docs/languages/custom/#example-add-sass-support-to-eleventy) which describes how to handle Sass/SCSS files with your [Eleventy](https://www.11ty.dev/) project.

I was not satisfied with the above solutions. Because:

The existing plugins do watch sass files by themselves or by using another toolkit, such as gulp.js, instead of using [Eleventy](https://www.11ty.dev/)'s file watching functionality. They are nice hacks and may work well, but doesn't seem to be integrated enough with Eleventy.

[The page in the official doc](https://www.11ty.dev/docs/languages/custom/#example-add-sass-support-to-eleventy) is great if you only have Sass/SCSS files which do not have `@use` or `@forward` rules.

If you use `@use` in your Sass/SCSS files, for example, and you change a dependency Sass/SCSS file, [Eleventy](https://www.11ty.dev/) will compile it (if its filename doesn't start with "\_"), but won't compile the dependant Sass/SCSS files, if you are following the instructions in [the page of official doc](https://www.11ty.dev/docs/languages/custom/#example-add-sass-support-to-eleventy).


## How [eleventy-sass](https://github.com/kentaroi/eleventy-sass) handles Sass/SCSS files
[Eleventy](https://www.11ty.dev/) watches files.

When [Eleventy](https://www.11ty.dev/) detects a file update, it will emit an `eleventy.beforeWatch` event first, and [eleventy-sass](https://github.com/kentaroi/eleventy-sass) will receive the event if the file is a Sass/SCSS file.

When [eleventy-sass](https://github.com/kentaroi/eleventy-sass) receives the event, it changes the cache keys for the changed file and its dependant Sass/SCSS files, which invalidates the cached CSSes, so that [Eleventy](https://www.11ty.dev/) will compile all of the files affected.

When compiling Sass/SCSS files, [Eleventy](https://www.11ty.dev/) calls `compile` function of the [elventy-sass](https://github.com/kentaroi/eleventy-sass).

The `compile` function of [elventy-sass](https://github.com/kentaroi/eleventy-sass) will compile Sass/SCSS files if they don't start with "\_".

The actual compilation is done by [sass](https://www.npmjs.com/package/sass), which is [dart-sass](https://github.com/sass/dart-sass).

By using the result of the compilation from [dart-sass](https://github.com/sass/dart-sass), [eleventy-sass](https://github.com/kentaroi/eleventy-sass) not only returns the compiled CSS, but also, if necessary, writes its sourcemap file and updates the dependency map, which [eleventy-sass](https://github.com/kentaroi/eleventy-sass) has internally and uses for invalidating cached CSSes of dependant files as described above.
