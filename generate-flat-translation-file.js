/* eslint-disable no-console */
/* eslint-disable no-prototype-builtins */
const language = process.argv[2] || "en";
const data = require(`./locale/en/translation.json`);
const transData = require(`./locale/${language}/translation.json`);
const fs = require("fs");

const currentFolder = process.cwd();

const flattenObject = (obj) => {
  let flattenKeys = {};
  for (let i in obj) {
    if (!obj.hasOwnProperty(i)) continue;
    if (typeof obj[i] == "object") {
      let flatObject = flattenObject(obj[i]);
      for (let j in flatObject) {
        if (!flatObject.hasOwnProperty(j)) continue;
        flattenKeys[i + "." + j] = flatObject[j];
      }
    } else {
      flattenKeys[i] = obj[i];
    }
  }
  return flattenKeys;
};
const flat = flattenObject(data);
const transFlat = flattenObject(transData);
let lines;
const keys = Object.keys(flat);
if (language == "en") {
  lines = [`"key","en"`];
  keys.forEach((key) => {
    const value = flat[key].replace(/"/g, '""');
    lines.push(`"${key}","${value}"`);
  });
}
if (language != "en") {
  lines = [`"key","en","${language}"`];
  keys.forEach((key) => {
    const transValue = (transFlat[key] || "").replace(/"/g, '""');
    const value = flat[key].replace(/"/g, '""');
    lines.push(
      `"${key}","${value}","${
        !value.startsWith("http") &&
        !value.startsWith("/") &&
        value == transValue
          ? ""
          : transValue
      }"`
    );
  });
}
const fileOutput = lines.join("\n");

fs.writeFile(
  `${currentFolder}/locale/${language}/translation-${language}-extract.csv`,
  fileOutput,
  function (err) {
    if (err) throw err;
    console.log(
      `\x1b[35m[filegen] locale/${language}/translation-${language}-extract.csv generated successfully.\x1b[0m`
    );
  }
);
