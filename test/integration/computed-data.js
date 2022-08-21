if (parseInt(process.version.match(/^v(\d+)/)[1]) < 16) {
  const test = require("ava");
  test("tests don't support node version < 16", async t => {
    t.pass();
  });
  return;
}

const util = require("util");
const exec = util.promisify(require("child_process").exec);
const path = require("path");
const { promises: fs } = require("fs");

const test = require("ava");

const createProject = require("./_create-project-default");
let dir;

test.before(async t => {
  dir = createProject("computed-data", "computed-data");
});

test("build (eleventyComputed.js has a property with String value) #13", async t => {
  let result;
  await t.notThrowsAsync(async () => {
    result = await exec("npx @11ty/eleventy", { cwd: dir });
  });
  let stylePath = path.join(dir, "_site", "css", "style.css");
  let styleCSS = await fs.readFile(stylePath, { encoding: "utf8" });
  t.is(styleCSS, "body{background-color:pink}");
});
