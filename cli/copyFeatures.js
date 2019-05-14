const fs = require('fs');
const path = require('path');
const glob = require('glob');


/**
 * Copies all '*.feature' files from the 'srcDir' directory to the 'dstDir'
 * directory, allowing for a transformation of the file basename and
 * the content on the way using the 'transform()' function
 */
module.exports = function copyFeatures(srcDir, dstDir, transform) {
  glob.sync(path.join(srcDir, '*.feature')).forEach((featureSrcPath) => {
    const featureSrcContent = fs.readFileSync(featureSrcPath, { encoding: 'utf-8' });
    const {
      basename: featureBasename,
      content: featureContent,
    } = transform({
      basename: path.basename(featureSrcPath),
      content: featureSrcContent,
    });
    const featurePath = path.join(dstDir, featureBasename);
    fs.writeFileSync(featurePath, featureContent, { encoding: 'utf-8' });
  });
}
