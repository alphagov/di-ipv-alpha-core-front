/* eslint-disable no-console */
const fs = require("fs");

var getFolders = function (dir, folder = "") {
  var results = [];
  var list = fs.readdirSync(dir, { withFileTypes: true });
  list.forEach(function (dirent) {
    if (dirent.isDirectory()) {
      /* Recurse into a subdirectory */
      results = results.concat(
        getFolders(dir + "/" + dirent.name, folder + "/" + dirent.name)
      );
      results.push(folder + "/" + dirent.name);
    }
  });
  return results;
};

const currentFolder = process.cwd();
const folders = getFolders(`${currentFolder}/app/features`);
const featuresOutput =
  folders
    .filter((folder) =>
      fs.existsSync(`${currentFolder}/app/features/${folder}/controller.ts`)
    )
    .map((folder) => `import ".${folder}";`)
    .join("\n") + "\n";

const header = fs.readFileSync(`${currentFolder}/license.txt`, "utf8");
const fileOutput = header + "\n" + featuresOutput;
fs.writeFile(
  `${currentFolder}/app/features/index.ts`,
  fileOutput,
  function (err) {
    if (err) throw err;
    console.log(
      "\x1b[35m[filegen] app/features/index.ts generated successfully.\x1b[0m"
    );
  }
);
