const fs = require("fs");
const path = require("path");
const sourceDir = path.join(__dirname, "fixtures", "eleventy-project-rev");

module.exports = function(projectName) {
  let projectDir = path.join(__dirname, "fixtures", projectName);
  fs.rmSync(projectDir, { recursive: true, force: true });
  fs.cpSync(sourceDir, projectDir, { recursive: true });

  return projectDir;
};
