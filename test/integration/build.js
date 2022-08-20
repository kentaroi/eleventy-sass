if (parseInt(process.version.match(/^v(\d+)/)[1]) < 16) {
  const test = require("ava");
  test("test doesn't support node version < 16", async t => {
    t.pass();
  });
} else {

const util = require("util");
const exec = util.promisify(require("child_process").exec);
const path = require("path");
const { promises: fs } = require("fs");
const { setTimeout } = require("timers/promises");

const test = require("ava");

const createProject = require("./_create-project-default");
let dir;

test.before(async t => {
  dir = createProject("build");
  await exec("npx @11ty/eleventy", { cwd: dir });
});

test("build", async t => {
  await t.notThrowsAsync(async () => await fs.access(path.join(dir, `_site/stylesheets/style.css`)));
  let stylesheetsDir = path.join(dir, "_site", "stylesheets");
  let csses = await fs.readdir(stylesheetsDir);
  t.deepEqual(csses, ["header.css", "style.css"]);

  let styleCSS = await fs.readFile(path.join(stylesheetsDir, "style.css"), { encoding: "utf8" });
  t.is(styleCSS, "header{background-color:pink}body{background-color:red}");

  let headerCSS = await fs.readFile(path.join(stylesheetsDir, "header.css"), { encoding: "utf8" });
  t.is(headerCSS, "header{background-color:pink}");
});

}
