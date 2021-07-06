/* eslint-disable no-console */
/* eslint-disable no-useless-escape */
const fs = require("fs");
const pseudoLocalization = require("pseudo-localization");

function translate(json) {
  const keys = Object.keys(json);
  keys.forEach((key) => {
    if (typeof json[key] === "string") {
      // split the string so we dont pseudoize the html tags, tricky regex (tag attributes will be missed but currently we don't have any)
      // also split out | as we are using it for a list delimiter
      const parts = json[key].match(
        /{{[^<]*}}|<[^<]*>|\||[\w\s.,\/#!$%\^&\*;:{}=–\-_`~()]*/gi
      );
      for (let index = 0; index < parts.length; index++) {
        // only pseudoize the raw text
        if (
          parts[index] &&
          !parts[index].startsWith("<") &&
          !parts[index].startsWith("|") &&
          !parts[index].startsWith("{{")
        ) {
          parts[index] =
            "### " + pseudoLocalization.localize(parts[index]) + " ###";
        }
      }
      // join it back together
      const str = parts.join("");
      json[key] = str;
    } else {
      // if it's not a string recurse
      translate(json[key]);
    }
  });
  return json;
}

const currentFolder = process.cwd();
// load the English language file
const text = fs.readFileSync(
  `${currentFolder}/locale/en/translation.json`,
  "utf8"
);
const json = JSON.parse(text);
const output = translate(json);
// create the destination folder it's not there
if (!fs.existsSync(`${currentFolder}/locale/fa`)) {
  fs.mkdirSync(
    `${currentFolder}/locale/fa`,
    {
      recursive: true,
      mode: 0o777,
    },
    (err) => {
      if (err) throw err;
    }
  );
}
// save the Persian language file
fs.writeFile(
  `${currentFolder}/locale/fa/translation.json`,
  JSON.stringify(output, null, 2),
  function (err) {
    if (err) throw err;
    console.log(
      "\x1b[35m[filegen] locale/fa/translation.json generated successfully.\x1b[0m"
    );
  }
);
