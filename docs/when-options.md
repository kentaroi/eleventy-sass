# `when` options

## How to use `when` property

`when` property is used for enabling and disabling the options object.

Suppose you have the following `.eleventy.js`.
```javascript
// .eleventy.js
const eleventySass = require("eleventy-sass");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(eleventySass, [
    {
      sass: {
        style: "compressed",
        sourceMap: false
      }
    }, {
      sass: {
        style: "expanded",
        sourceMap: true
      },
      when: "DEV"
    }, {
      rev: true,
      when: [ { ELEVENTY_ENV: "production" }, { ELEVENTY_ENV: "stage" } ]
    }
  ]);
};
```

You can see an array with three elements is passed to the second argument of `addPlugin()`.

The first element does not have `when` property, and it will be applied whatever environment/shell is set or not set, which means that the result CSS files will be compressed and not have source maps.

The second element has `when: "DEV"`, and the element will be applied when `DEV` environment/shell variable is set and is not empty.

Therefore, if you run the following:
```bash
DEV=1 npx @11ty/eleventy
```
the result CSS files are readable (expanded) and have source maps, because options at greater indexes wins options at smaller indexes.

The third element has `when: [ { ELEVENTY_ENV: "production" }, { ELEVENTY_ENV: "stage" } ]`, and the element will be applied when `ELEVENTY_ENV` environment/shell variable is "production" or "stage".

Therefore, if you run any of the followings:
```bash
ELEVENTY_ENV=production npx @11ty/eleventy
ELEVENTY_ENV=stage npx @11ty/eleventy
```
the result CSS files have revision hashes (because of the third options element) and they are minified (compressed) and don't have source maps (because of the first options element).

On the other hand, if you run the following:
```bash
DEV=1 ELEVENTY_ENV=production npx @11ty/eleventy
```
the result CSS files have revision hashes (because of the third options element) and they are readable (expanded) and have source maps (because of the second options element).

## Values that can be set to `when` property
`when` property should be of type `Boolean`, `String`, `Array`, `Object` or `Function`.

### `Array` type
If you set an array to `when` property, and if any of the elements is evaluated as `true`, `when` is evaluated as `true`. In other words, you can think of the array as the conditions (the elements of the array) which are connected with logical OR operator.

An element of the array should be of type `Boolean`, `String`, `Object` or `Function`.

### `Boolean` type
If you set `true` to `when` property, `when` is evaluated as `true`. If you set `false`, `when` is evaluated as `false`.

### `Function` type
For example, if you set a function like the following:
```javascript
when: () => process.platform === "linux"
```

The above `when` will be evaluated as `true` in Linux environment, and is evaluated as `false` in the other OS environments.

### `String` type
If you want to specify an environment/shell variable, you can set a string value to `when` property.

For example, if you set the following object to the second argument of the `addPlugin()`,

```javascript
{
  rev: true,
  when: "STAGING"
}
```

and if you run the following:
```bash
STAGING=1 npx @11ty/eleventy
```

Revision hashes will be enabled. (`STAGING` doesn't have to be `1`. It can be any value but empty string.)

But, if you run the following:
```bash
STAGING= npx @11ty/eleventy
```

or

```bash
npx @11ty/eleventy
```

Revision hashes will be disabled.

### `Object` type
If you set an object to `when` property, the properties of the object will be recognized as environment/shell variables. For example:

```javascript
when: {
  DRAFT: true
}
```

The above `when` property means "if `DRAFT` environment/shell variable is set."

The above `when` property is equivalent to the following `when` property:

```javascript
when: "DRAFT"
```

#### multiple properties
If you set an object with multiple properties, all of the properties should be evaluated as `true` for the object to be evaluated as `true`. 

```javascript
when: {
  ELEVENTY_ENV: "development",
  DRAFT: true
}
```

The above `when` is evaluated as `true`, only if `ELEVENTY_ENV` is `development` and `DRAFT` is defined and not an empty string. For example, when you run the following:

```bash
ELEVENTY_ENV=development DRAFT=1 npx @11ty/eleventy
```

it will be evaluated as `true`.

However, if you run any of the followings, it will be evaluated as `false`.

```bash
ELEVENTY_ENV=development npx @11ty/eleventy
DRAFT=1 npx @11ty/eleventy
ELEVENTY_ENV=production DRAFT=1 npx @11ty/eleventy
ELEVENTY_ENV=development DRAFT= npx @11ty/eleventy
```

You can think of an object with multiple properties as the conditions (the properties of the object) which are connected with logical AND operator.

#### `Boolean` type
##### `true` value

When you have the following:
```javascript
when: {
  DRAFT: true
}
```

If you run any of the followings, it will be evaluated as `true`,
```bash
DRAFT=1 npx @11ty/eleventy
DRAFT=foo npx @11ty/eleventy
```

and if you run any of the followings, it will be evaluated as `false`.

```bash
npx @11ty/eleventy
DRAFT= npx @11ty/eleventy
```

##### `false` value

When you have the following:
```javascript
when: {
  DRAFT: false
}
```

If you run any of the followings, it will be evaluated as `true`,
```bash
npx @11ty/eleventy
DRAFT= npx @11ty/eleventy
```

and if you run any of the followings, it will be evaluated as `false`.
```bash
DRAFT=1 npx @11ty/eleventy
DRAFT=foo npx @11ty/eleventy
```

#### `String` type
When you have the following:
```javascript
when: {
  ELEVENTY_ENV: "development"
}
```

If you run the follwoing, it will be evaluated as `true`,
```bash
ELEVENTY_ENV=development npx @11ty/eleventy
```

and if you run any of the followings, it will be evaluated as `false`.
```bash
ELEVENTY_ENV=production npx @11ty/eleventy
ELEVENTY_ENV=1 npx @11ty/eleventy
npx @11ty/eleventy
```

#### `RegExp` type
When you have the following:
```javascript
when: {
  ELEVENTY_ENV: /^dev(elopment)?$/
}
```

If you run the follwoing, it will be evaluated as `true`,
```bash
ELEVENTY_ENV=development npx @11ty/eleventy
ELEVENTY_ENV=dev npx @11ty/eleventy
```

and if you run any of the followings, it will be evaluated as `false`.
```bash
ELEVENTY_ENV=production npx @11ty/eleventy
ELEVENTY_ENV=develop npx @11ty/eleventy
ELEVENTY_ENV=d npx @11ty/eleventy
npx @11ty/eleventy
```

#### `Function` type
When you have the following:
```javascript
when: {
  ELEVENTY_ENV: (env) => "development".startsWith(env)
}
```

If you run any of the followings, it will be evaluated as `true`,
```bash
ELEVENTY_ENV=development npx @11ty/eleventy
ELEVENTY_ENV=dev npx @11ty/eleventy
ELEVENTY_ENV=d npx @11ty/eleventy
ELEVENTY_ENV= npx @11ty/eleventy
```

and if you run any of the followings, it will be evaluated as `false`.
```bash
ELEVENTY_ENV=production npx @11ty/eleventy
ELEVENTY_ENV=developing npx @11ty/eleventy
```
