/* eslint-disable no-console */
const fs = require("fs");
const KEY = 0,
  ENGLISH = 1,
  TRANSLATION = 2,
  STATE = 3;

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

translationFile.forEach((line) => {
  const found = errorFile.filter((i) => {
    return i[ENGLISH] == line[ENGLISH];
  });
  found.forEach((e) => {
    const found2 = errorFile.filter((x) => x[ENGLISH] == e[ENGLISH]);
    found2.forEach((f) => {
      const foundAt = errorFile
        .map(function (e) {
          return e[KEY];
        })
        .indexOf(f[KEY]);
      if (foundAt > 0) {
        if (line[ENGLISH] !== line[TRANSLATION] && line[TRANSLATION] !== "") {
          errorFile[foundAt][TRANSLATION] = line[TRANSLATION];
          errorFile[foundAt][STATE] = "done";
          console.log(line[KEY], foundAt);
        }
      }
    });
  });
});

const output = [];
errorFile.forEach((line) => {
  const lines = [];
  line.forEach((col) => {
    lines.push(`"${col}"`);
  });
  output.push(lines);
});

const mergeOutput = output.join("\n");
fs.writeFile(
  `./translation-dups-${header[TRANSLATION]}.csv`,
  mergeOutput,
  function (err) {
    if (err) throw err;
    console.log(
      `\x1b[35m[translation] translation-dups-${header[TRANSLATION]}.csv generated successfully.\x1b[0m`
    );
  }
);
