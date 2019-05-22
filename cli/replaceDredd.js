/**
 * Replaces mentions of the 'dredd' command in given '*.feature' file
 * content with a specific path to Dredd executable
 */
module.exports = function replaceDredd(text, dreddBin) {
  return text
    .replace(/I have "dredd"/g, `I have "${dreddBin}"`)
    .replace(/I run `dredd /g, `I run \`${dreddBin} `);
};
