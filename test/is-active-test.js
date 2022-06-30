const test = require("ava");
const isActive = require("../lib/is-active");

test("STRING", async t => {
  t.true(isActive("ELEVENTY_ENV", { "ELEVENTY_ENV": "1" }));
  t.false(isActive("ELEVENTY_ENV", { "ELEVENTY_ENV": "" }));
  t.false(isActive("ELEVENTY_ENV", { }));
  t.false(isActive("ELEVENTY_ENV", { "FOO": "foo" }));
});

test("empty Array", async t => {
  t.false(isActive([], { "ELEVENTY_ENV": "1" }));
  t.false(isActive([], { }));
});

test("boolean", async t => {
  t.true(isActive(true, { "ELEVENTY_ENV": "1" }));
  t.true(isActive(true, { }));
  t.false(isActive(false, { "ELEVENTY_ENV": "1" }));
  t.false(isActive(false, { }));
});

test('{ "FOO": true }', async t => {
  t.true(isActive({ "FOO": true }, { "FOO": "1" }));
  t.false(isActive({ "FOO": true }, { "FOO": "" }));
  t.false(isActive({ "FOO": true }, { }));
  t.false(isActive({ "FOO": true }, { "BAR": "1" }));
});

test('{ "FOO": false }', async t => {
  t.false(isActive({ "FOO": false }, { "FOO": "1" }));
  t.true(isActive({ "FOO": false }, { "FOO": "" }));
  t.true(isActive({ "FOO": false }, { }));
  t.true(isActive({ "FOO": false }, { "BAR": "1" }));
});

test('{ "FOO": "string" }', async t => {
  t.true(isActive({ "FOO": "string" }, { "FOO": "string" }));
  t.false(isActive({ "FOO": "string" }, { "FOO": "1" }));
  t.false(isActive({ "FOO": "string" }, { }));
  t.false(isActive({ "FOO": "string" }, { "BAR": "1" }));
});

test('{ "FOO": /regexp/ }', async t => {
  t.true(isActive({ "FOO": /foo+/ }, { "FOO": "foo" }));
  t.true(isActive({ "FOO": /foo+/ }, { "FOO": "foooooo" }));
  t.true(isActive({ "FOO": /foo+/ }, { "FOO": "fooh" }));
  t.false(isActive({ "FOO": /foo+/ }, { "FOO": "fo" }));
  t.false(isActive({ "FOO": /foo+/}, { "FOO": "foa" }));
  t.false(isActive({ "FOO": /foo+/}, { }));
  t.false(isActive({ "FOO": /foo+/}, { "BAR": "1" }));
});

test('{ "FOO": function }', async t => {
  t.true(isActive({ "FOO": v => v === "2" }, { "FOO": "2" }));
  t.false(isActive({ "FOO": v => v ==="2" }, { "FOO": "1" }));
  t.false(isActive({ "FOO": v => v ==="2" }, { "FOO": "" }));
  t.false(isActive({ "FOO": v => v ==="2" }, { }));
  t.false(isActive({ "FOO": v => v ==="2" }, { "BAR": "1" }));
});

test('{ "FOO": true, "BAR": true }', async t => {
  t.true(isActive({ "FOO": true, "BAR": true }, { "FOO": "1", "BAR": "1" }));
  t.true(isActive({ "FOO": true, "BAR": true }, { "FOO": "1", "BAR": "2" }));
  t.false(isActive({ "FOO": true, "BAR": true }, { "FOO": "1" }));
  t.false(isActive({ "FOO": true, "BAR": true }, { "BAR": "1" }));
  t.false(isActive({ "FOO": true, "BAR": true }, { "FOO": "1", "BAR": "" }));
  t.false(isActive({ "FOO": true, "BAR": true }, { "FOO": "", "BAR": "1" }));
  t.false(isActive({ "FOO": true, "BAR": true }, { }));
  t.false(isActive({ "FOO": true, "BAR": true }, { "BAZ": "1" }));
});

test('{ "FOO": true, "BAR": false }', async t => {
  t.true(isActive({ "FOO": true, "BAR": false }, { "FOO": "1", "BAR": "" }));
  t.true(isActive({ "FOO": true, "BAR": false }, { "FOO": "1" }));
  t.false(isActive({ "FOO": true, "BAR": false }, { "FOO": "", "BAR": "" }));
  t.false(isActive({ "FOO": true, "BAR": false }, { "FOO": "" }));
  t.false(isActive({ "FOO": true, "BAR": false }, { "FOO": "1", "BAR": "1" }));
  t.false(isActive({ "FOO": true, "BAR": false }, { "FOO": "", "BAR": "1" }));
  t.false(isActive({ "FOO": true, "BAR": false }, { }));
  t.false(isActive({ "FOO": true, "BAR": false }, { "BAZ": "1" }));
});

test('[ multiple OR conditions ]', async t => {
  const conditions = [
    "FOO",
    { "BAR": true },
    { "BAZ": "baz" },
    { "QUX": /^qux+$/ },
    { "QUUX": (env) => env === "quux" },
    { "QUUZ": "quuz", "CORGE": "corge" },
    false,
  ];

  t.true(isActive(conditions, { "FOO": "1" }));
  t.true(isActive(conditions, { "BAR": "1" }));
  t.true(isActive(conditions, { "BAZ": "baz" }));
  t.true(isActive(conditions, { "QUX": "quxxxxxxxxxx" }));
  t.true(isActive(conditions, { "QUUX": "quux" }));
  t.true(isActive(conditions, { "QUUZ": "quuz", "CORGE": "corge" }));

  t.false(isActive(conditions, { }));
  t.false(isActive(conditions, { "FOO": "" }));
  t.false(isActive(conditions, { "BAR": "" }));
  t.false(isActive(conditions, { "QUX": "Aqux" }));
  t.false(isActive(conditions, { "QUUX": "quuux" }));
  t.false(isActive(conditions, { "QUUZ": "quuz" }));
});
