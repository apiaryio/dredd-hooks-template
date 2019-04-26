const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const { spawnSync } = require('child_process');


const PROJECT_DIR = path.join(__dirname, '..');
const TEST_DIR = path.join(PROJECT_DIR, 'test');


function replacePlaceholders(content) {
  return content
    .replace(/dredd-hooks\-\{\{mylanguage\}\}/g, 'dredd-hooks-python')
    .replace(/import hooks/g, "import dredd_hooks as hooks")
    .replace(/\.\{\{myextension\}\}/g, '.py');
}


function uncommentPythonCodeBlocks(content) {
  let insidePythonCodeBlock = false;
  let quotationMarksSeen = 0;

  return content
    .split(/\r?\n/)
    .map((line) => {
      if (insidePythonCodeBlock) {
        line = line.replace(/^      \#/, '      ');
        quotationMarksSeen += /^      """/.test(line) ? 1 : 0;
        insidePythonCodeBlock = quotationMarksSeen < 2;
      } else {
        quotationMarksSeen = 0;
        insidePythonCodeBlock = /(Given|And) a file named ".+\.py"/i.test(line);
      };
      return line;
    })
    .join('\n');
}


fs.removeSync(TEST_DIR);
fs.mkdirSync(TEST_DIR);
fs.copySync(path.join(PROJECT_DIR, 'features'), path.join(TEST_DIR, 'features'));

glob.sync(path.join(TEST_DIR, '**/*.feature')).forEach((featurePath) => {
  const content = fs.readFileSync(featurePath, { encoding: 'utf-8' });
  const modifiedContent = uncommentPythonCodeBlocks(replacePlaceholders(content));
  fs.writeFileSync(featurePath, modifiedContent, { encoding: 'utf-8' });
})

const binDir = path.join(PROJECT_DIR, 'node_modules', '.bin');
const featuresDir = path.join(TEST_DIR, 'features');

const PATH = process.env.PATH.split(path.delimiter).concat([binDir]).join(path.delimiter);
const env = { ...process.env, PATH };

spawnSync('cucumber-js', [featuresDir], { cwd: TEST_DIR, env, stdio: 'inherit' });
