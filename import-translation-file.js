/* eslint-disable no-console */
/* eslint-disable no-useless-escape */
const enJson = require("./locale/en/translation.json");
const fs = require("fs");

const KEY = 0,
  ENGLISH = 1,
  TRANSLATION = 2;

const missingKey = [],
  englishDifferent = [];

const jsonNode = (json, base) => {
  const baseKey = base ? `${base}.` : "";
  const keys = Object.keys(json);
  keys.forEach((key) => {
    if (typeof json[key] != "string") {
      jsonNode(json[key], `${baseKey}${key}`);
      return;
    } else {
      count++;
      const found = output.find((item) => {
        return item[KEY] == `${baseKey}${key}`;
      });
      if ((found ? true : false) == false || found[TRANSLATION] == "") {
        missing++;
        console.log(
          `\x1b[31m[error] key:\x1b[34m${baseKey}${key}\x1b[31m missing from translation file\x1b[0m`
        );
        missingKey.push([
          `"${baseKey}${key}"`,
          `"${json[key].replace(/"/g, '""')}"`,
          `""`,
          `"MISSING"`,
        ]);
        return;
      }
      const englishParts = json[key]
        .replace(/"/g, '""')
        .match(/{{[^<]*}}|<[^<]*>|\||[\w\s.,\/#!$%\^&\*;:{}=–\-_`~()]*/gi);
      const englishTags = englishParts.filter((part) => {
        return (
          part.startsWith("<") || part.startsWith("|") || part.startsWith("{{")
        );
      });
      const translationParts = found[TRANSLATION].match(
        /{{[^<]*}}|<[^<]*>|\||[\w\s.,\/#!$%\^&\*;:{}=–\-_`~()]*/gi
      );
      const translationTags = translationParts.filter((part) => {
        return (
          part.startsWith("<") || part.startsWith("|") || part.startsWith("{{")
        );
      });
      if (
        englishTags &&
        translationTags &&
        englishTags.length !== translationTags.length
      ) {
        console.log(englishTags);
        console.log(translationTags);
        retranslations++;
        console.log(
          `\x1b[33m[warning] key:\x1b[34m${baseKey}${key}\x1b[33m tag count is different\x1b[0m`
        );
        englishDifferent.push([
          `"${baseKey}${key}"`,
          `"${json[key].replace(/"/g, '""')}"`,
          `"${found[TRANSLATION]}"`,
          `"TAGCOUNT"`,
          `"${englishTags.length}"`,
          `"${translationTags.length}"`,
        ]);
        json[key] = found[TRANSLATION].replace(/""/g, '"') || "";
        return;
      }
      if (
        englishTags &&
        translationTags &&
        JSON.stringify(englishTags) != JSON.stringify(translationTags)
      ) {
        console.log(englishTags);
        console.log(translationTags);
        retranslations++;
        console.log(
          `\x1b[33m[warning] key:\x1b[34m${baseKey}${key}\x1b[33m tag count is different\x1b[0m`
        );
        englishDifferent.push([
          `"${baseKey}${key}"`,
          `"${json[key].replace(/"/g, '""')}"`,
          `"${found[TRANSLATION]}"`,
          `"TAGVALUES"`,
          `"${JSON.stringify(englishTags).replace(/"/g, '""')}"`,
          `"${JSON.stringify(translationTags).replace(/"/g, '""')}"`,
        ]);
        json[key] = found[TRANSLATION].replace(/""/g, '"') || "";
        return;
      }
      if (json[key].replace(/"/g, '""') != found[ENGLISH]) {
        retranslations++;
        console.log(
          `\x1b[33m[warning] key:\x1b[34m${baseKey}${key}\x1b[33m englsh text has changed\x1b[0m`
        );
        englishDifferent.push([
          `"${baseKey}${key}"`,
          `"${json[key].replace(/"/g, '""')}"`,
          `"${found[TRANSLATION]}"`,
          `"CHANGED"`,
          `"${found[ENGLISH]}"`,
        ]);
        json[key] = found[TRANSLATION].replace(/""/g, '"') || "";
        return;
      }
      json[key] = found[TRANSLATION].replace(/""/g, '"') || "";
    }
  });
  return;
};

const fileName = process.argv[2];
let file = fs.readFileSync(fileName, "utf8");
file = file.replace(/\\r\\n/g, "\n");
const lines = file.split("\n");
const output = [];
lines.forEach((line) => {
  const cols = line.split('","');
  cols[KEY] = cols[KEY].substring(1);
  cols[cols.length - 1] = cols[cols.length - 1].slice(0, -1);
  output.push(cols);
});
const header = output[0];
console.log(
  `Translations from '${header[ENGLISH]} to '${header[TRANSLATION]}'`
);
console.log("Number of translation lines in file:", output.length - 1);
let count = 0,
  missing = 0,
  retranslations = 0;

jsonNode(enJson);

fs.writeFile(
  `./locale/${header[TRANSLATION]}/translation.json`,
  JSON.stringify(enJson, null, 2),
  function (err) {
    if (err) throw err;
    console.log(
      `\x1b[35m[translation] locale/${header[TRANSLATION]}/translation.json generated successfully.\x1b[0m`
    );
  }
);

console.log("Number of translations processed:", count);
console.log("Number of missing translations:", missing);
console.log("Number of potential re-translations:", retranslations);

const outputMissing = [
  [
    `"${header[KEY]}"`,
    `"${header[ENGLISH]}"`,
    `"${header[TRANSLATION]}"`,
    `"reason"`,
  ],
  ...missingKey,
];
const outputDifferent = [
  [
    `"${header[KEY]}"`,
    `"${header[ENGLISH]}"`,
    `"${header[TRANSLATION]}"`,
    `"reason"`,
  ],
  ...englishDifferent,
];

if (outputMissing.length > 1) {
  const errorOutput = outputMissing.join("\n");
  fs.writeFile(
    `./translation-missing-${header[TRANSLATION]}.csv`,
    errorOutput,
    function (err) {
      if (err) throw err;
      console.log(
        `\x1b[35m[translation] translation-missing-${header[TRANSLATION]}.csv generated successfully.\x1b[0m`
      );
    }
  );
}

if (outputDifferent.length > 1) {
  const errorOutput = outputDifferent.join("\n");
  fs.writeFile(
    `./translation-different-${header[TRANSLATION]}.csv`,
    errorOutput,
    function (err) {
      if (err) throw err;
      console.log(
        `\x1b[35m[translation] translation-different-${header[TRANSLATION]}.csv generated successfully.\x1b[0m`
      );
    }
  );
}
