const test = require("ava");
const getLoadPathsFixedSassOptions = require("../lib/get-load-paths-fixed-sass-options");

test("default config.dir, { }", async t => {
  let sassOptions = {
    anotherProperty: true
  };
  let dir = "stylesheets";
  let config = {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };

  let result = getLoadPathsFixedSassOptions(sassOptions, dir, config);
  t.deepEqual(result, {
    anotherProperty: true,
    loadPaths: [
      "stylesheets",
      "_includes"
    ]
  });
});

test("default config.dir, { loadPaths: array }", async t => {
  let sassOptions = {
    anotherProperty: true,
    loadPaths: ["node_modules/foo/bar", "node_modules/baz/qux"]
  };
  let dir = "stylesheets";
  let config = {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };

  let result = getLoadPathsFixedSassOptions(sassOptions, dir, config);
  t.deepEqual(result, {
    anotherProperty: true,
    loadPaths: [
      "stylesheets",
      "node_modules/foo/bar",
      "node_modules/baz/qux",
      "_includes"
    ]
  });
});

test("default config.dir, { loadPaths: string }", async t => {
  let sassOptions = {
    anotherProperty: true,
    loadPaths: "node_modules/foo/bar, node_modules/baz/qux"
  };
  let dir = "stylesheets";
  let config = {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };

  let result = getLoadPathsFixedSassOptions(sassOptions, dir, config);
  t.deepEqual(result, {
    anotherProperty: true,
    loadPaths: [
      "stylesheets",
      "node_modules/foo/bar",
      "node_modules/baz/qux",
      "_includes"
    ]
  });
});

test("default config.dir, { includes: array }", async t => {
  let sassOptions = {
    anotherProperty: true,
    includes: ["_includes/stylesheets", "_includes/css"]
  };
  let dir = "stylesheets";
  let config = {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };

  let result = getLoadPathsFixedSassOptions(sassOptions, dir, config);
  t.deepEqual(result, {
    anotherProperty: true,
    loadPaths: [
      "stylesheets",
      "_includes/stylesheets",
      "_includes/css"
    ]
  });
});

test("default config.dir, { includes: string }", async t => {
  let sassOptions = {
    anotherProperty: true,
    includes: "_includes/stylesheets, _includes/css"
  };
  let dir = "stylesheets";
  let config = {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };

  let result = getLoadPathsFixedSassOptions(sassOptions, dir, config);
  t.deepEqual(result, {
    anotherProperty: true,
    loadPaths: [
      "stylesheets",
      "_includes/stylesheets",
      "_includes/css"
    ]
  });
});

test("default config.dir, { includes: false }", async t => {
  let sassOptions = {
    anotherProperty: true,
    includes: false
  };
  let dir = "stylesheets";
  let config = {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };

  let result = getLoadPathsFixedSassOptions(sassOptions, dir, config);
  t.deepEqual(result, {
    anotherProperty: true,
    loadPaths: [
      "stylesheets"
    ]
  });
});

test("default config.dir, { loadPaths: array, includes: array }", async t => {
  let sassOptions = {
    anotherProperty: true,
    loadPaths: ["node_modules/foo/bar", "node_modules/baz/qux"],
    includes: ["_includes/stylesheets", "_includes/css"]
  };
  let dir = "stylesheets";
  let config = {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };

  let result = getLoadPathsFixedSassOptions(sassOptions, dir, config);
  t.deepEqual(result, {
    anotherProperty: true,
    loadPaths: [
      "stylesheets",
      "node_modules/foo/bar",
      "node_modules/baz/qux",
      "_includes/stylesheets",
      "_includes/css"
    ]
  });
});

test("default config.dir, { loadPaths: string, includes: string }", async t => {
  let sassOptions = {
    anotherProperty: true,
    loadPaths: "node_modules/foo/bar, node_modules/baz/qux",
    includes: "_includes/stylesheets, _includes/css"
  };
  let dir = "stylesheets";
  let config = {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };

  let result = getLoadPathsFixedSassOptions(sassOptions, dir, config);
  t.deepEqual(result, {
    anotherProperty: true,
    loadPaths: [
      "stylesheets",
      "node_modules/foo/bar",
      "node_modules/baz/qux",
      "_includes/stylesheets",
      "_includes/css"
    ]
  });
});

test("default config.dir, { loadPaths: array, includes: false }", async t => {
  let sassOptions = {
    anotherProperty: true,
    loadPaths: ["node_modules/foo/bar", "node_modules/baz/qux"],
    includes: false
  };
  let dir = "stylesheets";
  let config = {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };

  let result = getLoadPathsFixedSassOptions(sassOptions, dir, config);
  t.deepEqual(result, {
    anotherProperty: true,
    loadPaths: [
      "stylesheets",
      "node_modules/foo/bar",
      "node_modules/baz/qux"
    ]
  });
});


test("custom config.dir, { }", async t => {
  let sassOptions = {
    anotherProperty: true
  };
  let dir = "src/stylesheets";
  let config = {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "dist"
    }
  };

  let result = getLoadPathsFixedSassOptions(sassOptions, dir, config);
  t.deepEqual(result, {
    anotherProperty: true,
    loadPaths: [
      "src/stylesheets",
      "src/_includes"
    ]
  });
});

test("custom config.dir, { loadPaths: array }", async t => {
  let sassOptions = {
    anotherProperty: true,
    loadPaths: ["node_modules/foo/bar", "node_modules/baz/qux"]
  };
  let dir = "src/stylesheets";
  let config = {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "dist"
    }
  };

  let result = getLoadPathsFixedSassOptions(sassOptions, dir, config);
  t.deepEqual(result, {
    anotherProperty: true,
    loadPaths: [
      "src/stylesheets",
      "node_modules/foo/bar",
      "node_modules/baz/qux",
      "src/_includes"
    ]
  });
});

test("custom config.dir, { loadPaths: string }", async t => {
  let sassOptions = {
    anotherProperty: true,
    loadPaths: "node_modules/foo/bar, node_modules/baz/qux"
  };
  let dir = "src/stylesheets";
  let config = {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "dist"
    }
  };

  let result = getLoadPathsFixedSassOptions(sassOptions, dir, config);
  t.deepEqual(result, {
    anotherProperty: true,
    loadPaths: [
      "src/stylesheets",
      "node_modules/foo/bar",
      "node_modules/baz/qux",
      "src/_includes"
    ]
  });
});

test("custom config.dir, { includes: array }", async t => {
  let sassOptions = {
    anotherProperty: true,
    includes: ["_includes/stylesheets", "_includes/css"]
  };
  let dir = "src/stylesheets";
  let config = {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "dist"
    }
  };

  let result = getLoadPathsFixedSassOptions(sassOptions, dir, config);
  t.deepEqual(result, {
    anotherProperty: true,
    loadPaths: [
      "src/stylesheets",
      "src/_includes/stylesheets",
      "src/_includes/css"
    ]
  });
});

test("custom config.dir, { includes: string }", async t => {
  let sassOptions = {
    anotherProperty: true,
    includes: "_includes/stylesheets, _includes/css"
  };
  let dir = "src/stylesheets";
  let config = {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "dist"
    }
  };

  let result = getLoadPathsFixedSassOptions(sassOptions, dir, config);
  t.deepEqual(result, {
    anotherProperty: true,
    loadPaths: [
      "src/stylesheets",
      "src/_includes/stylesheets",
      "src/_includes/css"
    ]
  });
});

test("custom config.dir, { includes: false }", async t => {
  let sassOptions = {
    anotherProperty: true,
    includes: false
  };
  let dir = "src/stylesheets";
  let config = {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "dist"
    }
  };

  let result = getLoadPathsFixedSassOptions(sassOptions, dir, config);
  t.deepEqual(result, {
    anotherProperty: true,
    loadPaths: [
      "src/stylesheets"
    ]
  });
});

test("custom config.dir, { loadPaths: array, includes: array }", async t => {
  let sassOptions = {
    anotherProperty: true,
    loadPaths: ["node_modules/foo/bar", "node_modules/baz/qux"],
    includes: ["_includes/stylesheets", "_includes/css"]
  };
  let dir = "src/stylesheets";
  let config = {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "dist"
    }
  };

  let result = getLoadPathsFixedSassOptions(sassOptions, dir, config);
  t.deepEqual(result, {
    anotherProperty: true,
    loadPaths: [
      "src/stylesheets",
      "node_modules/foo/bar",
      "node_modules/baz/qux",
      "src/_includes/stylesheets",
      "src/_includes/css"
    ]
  });
});

test("custom config.dir, { loadPaths: string, includes: string }", async t => {
  let sassOptions = {
    anotherProperty: true,
    loadPaths: "node_modules/foo/bar, node_modules/baz/qux",
    includes: "_includes/stylesheets, _includes/css"
  };
  let dir = "src/stylesheets";
  let config = {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "dist"
    }
  };

  let result = getLoadPathsFixedSassOptions(sassOptions, dir, config);
  t.deepEqual(result, {
    anotherProperty: true,
    loadPaths: [
      "src/stylesheets",
      "node_modules/foo/bar",
      "node_modules/baz/qux",
      "src/_includes/stylesheets",
      "src/_includes/css"
    ]
  });
});

test("custom config.dir, { loadPaths: array, includes: false }", async t => {
  let sassOptions = {
    anotherProperty: true,
    loadPaths: ["node_modules/foo/bar", "node_modules/baz/qux"],
    includes: false
  };
  let dir = "src/stylesheets";
  let config = {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "dist"
    }
  };

  let result = getLoadPathsFixedSassOptions(sassOptions, dir, config);
  t.deepEqual(result, {
    anotherProperty: true,
    loadPaths: [
      "src/stylesheets",
      "node_modules/foo/bar",
      "node_modules/baz/qux"
    ]
  });
});
