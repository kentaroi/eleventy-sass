const fs = require("fs");
const path = require("path");
const sourceDir = path.join(__dirname, "fixtures", "eleventy-project-rev");

module.exports = function(projectName) {
  let projectDir = path.join(__dirname, "fixtures", projectName);
  fs.rmSync(projectDir, { recursive: true, force: true });
  fs.mkdirSync(projectDir);

  let names = fs.readdirSync(sourceDir);
  names.forEach(name => {
    fs.symlinkSync(path.join(sourceDir, name), path.join(projectDir, name));
  });

  return projectDir;
};
