const fs = require("fs");
const path = require("path");
const sourceDir = path.join(__dirname, "fixtures", "eleventy-project");

module.exports = function(projectName) {
  let projectDir = path.join(__dirname, "fixtures", projectName);
  fs.rmSync(projectDir, { recursive: true, force: true });
  fs.mkdirSync(projectDir);
  fs.mkdirSync(path.join(projectDir, "dist"));

  let names = fs.readdirSync(sourceDir);
  names.forEach(name => {
    fs.symlinkSync(path.join(sourceDir, name), path.join(projectDir, name));
  });
  ["package.json", "package-lock.json", "node_modules"].forEach(name => {
    fs.symlinkSync(name, path.join(projectDir, name));
  });

  return projectDir;
};
