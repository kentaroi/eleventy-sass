const test = require("ava");
const parseOptions = require("../lib/parse-options");

const defaultOptionsArray = [
  {
    outputFileExtension: "css",
    compileOptions: {
      cache: true
    },
    sass: {
      style: "expanded",
      sourceMap: true,
      sourceMapIncludesSources: true
    }
  }, {
    sass: {
      style: "compressed",
      sourceMap: false,
    },
    when: { "ELEVENTY_ENV": env => env == undefined || "production".startsWith(env) }
  }
];

test("undefined options with empty default", async t => {
  const emptyDefaultOptionsArray = [];
  const op = parseOptions(emptyDefaultOptionsArray);
  const { options, sassOptions, postcss } = parseOptions(emptyDefaultOptionsArray);
  t.deepEqual(options, {});
  t.deepEqual(sassOptions, {});
  t.is(postcss, undefined);
});

test("undefined options with default when implicitly in production", async t => {
  const { options, sassOptions, postcss } = parseOptions(defaultOptionsArray, undefined, {});
  t.deepEqual(options, {
    outputFileExtension: "css",
    compileOptions: {
      cache: true
    }
  });
  t.deepEqual(sassOptions, {
    style: "compressed",
    sourceMap: false,
    sourceMapIncludesSources: true
  });
  t.is(postcss, undefined);
});

test("undefined options with default when in production", async t => {
  const env = { "ELEVENTY_ENV": "prod" };
  const { options, sassOptions, postcss } = parseOptions(defaultOptionsArray, undefined, env);
  t.deepEqual(options, {
    outputFileExtension: "css",
    compileOptions: {
      cache: true
    }
  });
  t.deepEqual(sassOptions, {
    style: "compressed",
    sourceMap: false,
    sourceMapIncludesSources: true
  });
  t.is(postcss, undefined);
});

test("undefined options with default when not in production", async t => {
  const env = { "ELEVENTY_ENV": "development" };
  const { options, sassOptions, postcss } = parseOptions(defaultOptionsArray, undefined, env);
  t.deepEqual(options, {
    outputFileExtension: "css",
    compileOptions: {
      cache: true
    }
  });
  t.deepEqual(sassOptions, {
    style: "expanded",
    sourceMap: true,
    sourceMapIncludesSources: true
  });
  t.is(postcss, undefined);
});

test("options without `when` overwrite default in any environment", async t => {
  const environments = [
    { "ELEVENTY_ENV": "development" },
    { "ELEVENTY_ENV": "production" },
    { }
  ];

  const userOptions = {
    read: false,
    compileOptions: {
      cache: false
    },
    sass: {
      style: "expanded",
      sourceMap: true
    },
    postcss: "dummy"
  };

  for (let env of environments) {
    const { options, sassOptions, postcss } = parseOptions(defaultOptionsArray, userOptions, env);
    t.deepEqual(options, {
      outputFileExtension: "css",
      read: false,
      compileOptions: {
        cache: false
      }
    });
    t.deepEqual(sassOptions, {
      style: "expanded",
      sourceMap: true,
      sourceMapIncludesSources: true
    });
    t.is(postcss, "dummy");
  }
});

test("options partially overwrite the `compileOptions`", async t => {
  const defaultOptions = [
    {
      compileOptions: {
        foo: "FOO",
        bar: "BAR"
      }, sass: {
        style: "expanded"
      }
    }
  ];

  const userOptions = [
    {
      compileOptions: {
        bar: "BAZ"
      }
    }
  ];

  const { options, sassOptions, postcss } = parseOptions(defaultOptions, userOptions, {});

  t.deepEqual(options, {
    compileOptions: {
      foo: "FOO",
      bar: "BAZ"
    }
  });
  t.deepEqual(sassOptions, { style: "expanded" });
  t.is(postcss, undefined);
});

test("options partially overwrite the `sass`", async t => {
  const defaultOptions = [
    {
      compileOptions: {
        foo: "FOO",
        bar: "BAR"
      }, sass: {
        style: "expanded",
        sourceMap: true
      }
    }
  ];

  const userOptions = [
    {
      sass: {
        style: "compressed"
      }
    }
  ];

  const { options, sassOptions, postcss } = parseOptions(defaultOptions, userOptions, {});

  t.deepEqual(options, {
    compileOptions: {
      foo: "FOO",
      bar: "BAR"
    }
  });
  t.deepEqual(sassOptions, {
    style: "compressed",
    sourceMap: true
  });
  t.is(postcss, undefined);
});

test("options don't overwrite default when `when` is not satisfied", async t => {
  const defaultOptions = [
    {
      compileOptions: {
        foo: "FOO",
        bar: "BAR"
      }, sass: {
        style: "expanded",
        sourceMap: true
      }
    }
  ];

  const userOptions = [
    {
      outputFileExtension: "qux",
      compileOptions: {
        bar: "BAZ"
      },
      sass: {
        style: "compressed"
      },
      postcss: "dummy",
      when: { "ELEVENTY_ENV": "staging" }
    }
  ];

  const { options, sassOptions, postcss } = parseOptions(defaultOptions, userOptions, { "ELEVENTY_ENV": "development" });

  t.deepEqual(options, {
    compileOptions: {
      foo: "FOO",
      bar: "BAR"
    }
  });
  t.deepEqual(sassOptions, {
    style: "expanded",
    sourceMap: true
  });
  t.is(postcss, undefined);
});

test("options overwrite default when `when` is satisfied", async t => {
  const defaultOptions = [
    {
      compileOptions: {
        foo: "FOO",
        bar: "BAR"
      }, sass: {
        style: "expanded",
        sourceMap: true
      }
    }
  ];

  const userOptions = [
    {
      outputFileExtension: "qux",
      compileOptions: {
        bar: "BAZ"
      },
      sass: {
        style: "compressed"
      },
      postcss: "dummy",
      when: { "ELEVENTY_ENV": "staging" }
    }
  ];

  const { options, sassOptions, postcss } = parseOptions(defaultOptions, userOptions, { "ELEVENTY_ENV": "staging" });

  t.deepEqual(options, {
    outputFileExtension: "qux",
    compileOptions: {
      foo: "FOO",
      bar: "BAZ"
    }
  });
  t.deepEqual(sassOptions, {
    style: "compressed",
    sourceMap: true
  });
  t.is(postcss, "dummy");
});

test("later options has precedence over earlier", async t => {
  const defaultOptions = [
    {
      outputFileExtension: "foo"
    }
  ];

  const userOptions = [
    {
      outputFileExtension: "bar",
      postcss: "bar"
    }, {
      outputFileExtension: "baz",
      postcss: "baz"
    }, {
      outputFileExtension: "qux",
      postcss: "qux"
    }
  ];

  const { options, sassOptions, postcss } = parseOptions(defaultOptions, userOptions, { "ELEVENTY_ENV": "staging" });

  t.deepEqual(options, {
    outputFileExtension: "qux"
  });
  t.is(postcss, "qux");
});

test("options overwrite default", async t => {
  const environments = [
    { "ELEVENTY_ENV": "development" },
    { "ELEVENTY_ENV": "production" },
    { "ELEVENTY_ENV": "staging" },
    { }
  ];

  const userOptions = [
    {
      outputFileExtension: "css",
      compileOptions: {
        permalink: "style.css"
      },
      sass: {
        style: "compressed"
      },
      postcss: "dummy"
    }, {
      sass: {
        sourceMap: true
      },
      when: { "ELEVENTY_ENV": "staging" }
    }, {
      compileOptions: {
        permalink: "style-revhash.css"
      },
      when: { "ELEVENTY_ENV": "production" } // should be set "production" explicitly
    }
  ];

  for (let env of environments) {
    const { options, sassOptions, postcss } = parseOptions(defaultOptionsArray, userOptions, env);
    const message = `for env: ${ env.ELEVENTY_ENV }`;
    t.is(options.outputFileExtension, "css");
    t.is(options.compileOptions.cache, true, message);
    t.is(sassOptions.style, "compressed", message);
    t.is(sassOptions.sourceMapIncludesSources, true, message);
    t.is(postcss, "dummy");
    switch (env.ELEVENTY_ENV) {
      case "development":
        t.is(options.compileOptions.permalink, "style.css");
        t.true(sassOptions.sourceMap);
        break;
      case "production":
        t.is(options.compileOptions.permalink, "style-revhash.css");
        t.false(sassOptions.sourceMap);
        break;
      case undefined:
        t.is(options.compileOptions.permalink, "style.css", "no revhash in implicit production env");
        t.false(sassOptions.sourceMap);
        break;
      case "staging":
        t.is(options.compileOptions.permalink, "style.css");
        t.true(sassOptions.sourceMap);
        break;
      default:
        throw Error(`Unexpected env: ${ env }`);
    }
  }
});
