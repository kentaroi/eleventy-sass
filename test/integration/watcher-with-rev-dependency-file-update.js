if (parseInt(process.version.match(/^v(\d+)/)[1]) < 16) {
  const test = require("ava");
  test("tests don't support node version < 16", async t => {
    t.pass();
  });
  return;
}

const { spawn } = require("child_process");
const path = require("path");
const { promises: fs } = require("fs");
const { setTimeout } = require("timers/promises");
const { createHash } = require("crypto");

const test = require("ava");
const Semaphore = require("@debonet/es6semaphore");

const createProject = require("./_create-project-default");
let dir;
let proc;
let pid;

const headerCssContent = "header{background-color:pink}";
const headerRevHash = createHash("sha256").update(headerCssContent).digest("hex").slice(0, 8);

const updatedHeaderCssContent = "header{background-color:red}";
const updatedHeaderRevHash = createHash("sha256").update(updatedHeaderCssContent).digest("hex").slice(0, 8);

const styleCssContent = "header{background-color:pink}body{background-color:red}";
const styleRevHash = createHash("sha256").update(styleCssContent).digest("hex").slice(0, 8);

const updatedStyleCssContent = "header{background-color:red}body{background-color:red}";
const updatedStyleRevHash = createHash("sha256").update(updatedStyleCssContent).digest("hex").slice(0, 8);

test.after.always("cleanup child process", t => {
  if (proc && proc.exitCode === null) {
    pid ? process.kill(pid, "SIGINT") : proc.kill();
  }
});

test.before(async t => {
  let sem = new Semaphore(1);
  await sem.wait();
  dir = createProject("watcher-with-rev-dependency-file-update");
  proc = spawn("npx", ["@11ty/eleventy", "--config=config-for-watcher-with-rev.js", "--watch"], { cwd: dir, shell: true, timeout: 20000 });
  proc.on("exit", (code, signal) => {
    if (process.platform === "darwin")
      pid = undefined;
    sem.signal();
  });
  proc.stdout.on("data", function(data) {
    let str = data.toString();

    let match = str.match(/^Eleventy PID: (\d+)/);
    if (match) {
      pid = parseInt(match[1]);
    }

    if (str.trim() === "[11ty] Watching…") {
      sem.signal();
    }
  });
  await sem.wait();
  await setTimeout(300);


  let stylesheetsDir = path.join(dir, "_site", "stylesheets");
  let csses = await fs.readdir(stylesheetsDir);
  t.deepEqual(csses, [`header-${ headerRevHash }.css`, `style-${ styleRevHash }.css`]);


  let headerSCSS = path.join(dir, "stylesheets", "header.scss");
  fs.writeFile(headerSCSS, `header {
    background-color: red;
  }`);

  await sem.wait();
  await setTimeout(300);

  if (pid) {
    process.kill(pid, "SIGINT");
    pid = undefined;
    await sem.wait();
  }
});

test("write CSS files with correct revision hashes", async t => {
  let stylesheetsDir = path.join(dir, "_site", "stylesheets");
  let csses = await fs.readdir(stylesheetsDir);
  t.is(csses.length, 4);
  t.true(csses.includes(`header-${ headerRevHash }.css`));
  t.true(csses.includes(`header-${ updatedHeaderRevHash }.css`));
  t.true(csses.includes(`style-${ styleRevHash }.css`));
  t.true(csses.includes(`style-${ updatedStyleRevHash }.css`));
});


test("watcher works", async t => {
  let headerPath = path.join(dir, "_site", "stylesheets", `header-${ headerRevHash }.css`);
  let headerCss = await fs.readFile(headerPath, { encoding: "utf8" });
  t.is(headerCss, headerCssContent);

  let updatedHeaderPath = path.join(dir, "_site", "stylesheets", `header-${ updatedHeaderRevHash }.css`);
  let updatedHeaderCss = await fs.readFile(updatedHeaderPath, { encoding: "utf8" });
  t.is(updatedHeaderCss, updatedHeaderCssContent);

  let stylePath = path.join(dir, "_site", "stylesheets", `style-${ styleRevHash }.css`);
  let styleCss = await fs.readFile(stylePath, { encoding: "utf8" });
  t.is(styleCss, styleCssContent);

  let updatedStylePath = path.join(dir, "_site", "stylesheets", `style-${ updatedStyleRevHash }.css`);
  let updatedStyleCss = await fs.readFile(updatedStylePath, { encoding: "utf8" });
  t.is(updatedStyleCss, updatedStyleCssContent);
});
