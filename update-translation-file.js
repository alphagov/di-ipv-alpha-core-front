/* eslint-disable no-console */
const fs = require("fs");
const KEY = 0,
  TRANSLATION = 2;

const getFile = (fileName, encoding = "utf8") => {
  let file = fs.readFileSync(fileName, encoding);
  const lines = file.split("\n");
  const output = [];
  lines.forEach((line) => {
    const cols = line.split('","');
    cols[KEY] = cols[KEY].substring(1);
    cols[cols.length - 1] = cols[cols.length - 1].slice(0, -1);
    output.push(cols);
  });
  return output;
};

const translationFile = getFile(process.argv[2]);
const errorFile = getFile(process.argv[3]);
const header = errorFile[0];

errorFile.forEach((line) => {
  const foundAt = translationFile
    .map(function (e) {
      return e[KEY];
    })
    .indexOf(line[KEY]);
  if (line[3] == "done") {
    if (foundAt == -1) {
      translationFile.push(line);
    }
    if (foundAt > 0) {
      translationFile[foundAt] = line;
    }
  }
  console.log(line[KEY], foundAt);
});

const output = [];
translationFile.forEach((line) => {
  const lines = [];
  line.forEach((col) => {
    lines.push(`"${col}"`);
  });
  output.push(lines);
});

const mergeOutput = output.join("\n");
fs.writeFile(
  `./translation-merge-${header[TRANSLATION]}.csv`,
  mergeOutput,
  function (err) {
    if (err) throw err;
    console.log(
      `\x1b[35m[translation] translation-merge-${header[TRANSLATION]}.csv generated successfully.\x1b[0m`
    );
  }
);
