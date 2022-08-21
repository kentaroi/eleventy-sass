const fs = require("fs");
const path = require("path");

module.exports = function(projectName, projectType = "default") {
  const sourceName = "eleventy-project-" + projectType;
  const sourceDir = path.join(__dirname, "fixtures", sourceName);
  const projectDir = path.join(__dirname, "fixtures", projectName);
  fs.rmSync(projectDir, { recursive: true, force: true });

  fs.cpSync(sourceDir, projectDir, { recursive: true });

  return projectDir;
};
