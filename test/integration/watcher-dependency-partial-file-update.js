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

const test = require("ava");
const Semaphore = require("@debonet/es6semaphore");

const createProject = require("./_create-project-default");
let dir;
let proc;
let pid;

test.after.always("cleanup child process", t => {
  if (proc && proc.exitCode === null) {
    pid ? process.kill(pid, "SIGINT") : proc.kill();
  }
});

test.before(async t => {
  let sem = new Semaphore(1);
  await sem.wait();
  dir = createProject("watcher-dependency-partial-file-update");
  proc = spawn("npx", ["@11ty/eleventy", "--watch"], { cwd: dir, shell: true, timeout: 20000 });
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

    if (str.trim() === "[11ty] Watching…")
      sem.signal();
  });
  await sem.wait();
  await setTimeout(300);

  let colorsSCSS = path.join(dir, "_includes", "colors.scss");
  fs.writeFile(colorsSCSS, "$background: blue;");

  await sem.wait();
  await setTimeout(300);

  if (pid && process.kill(pid, "SIGINT"))
    pid = undefined;

  await sem.wait();
});

test("write CSS files compiled from SCSS", async t => {
  let stylesheetsDir = path.join(dir, "_site", "stylesheets");
  let csses = await fs.readdir(stylesheetsDir);
  t.deepEqual(csses, ["header.css", "style.css"]);
});


test("watcher works", async t => {
  let styleCSS = await fs.readFile(path.join(dir, "_site/stylesheets/style.css"), { encoding: "utf8" });
  t.is(styleCSS, "header{background-color:pink}body{background-color:blue}");
});
