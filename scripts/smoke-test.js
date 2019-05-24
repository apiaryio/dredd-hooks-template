const os = require('os');
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const packageData = require('../package');
const run = require('../cli/run');


function replacePlaceholders(content) {
  return content
    .replace(/\{\{my-executable-path\}\}/g, 'dredd-hooks-python')
    .replace(/import hooks/g, 'import dredd_hooks as hooks')
    .replace(/\.\{\{my-extension\}\}/g, '.py');
}

function uncommentPythonCodeBlocks(content) {
  let insidePythonCodeBlock = false;
  let quotationMarksSeen = 0;

  return content
    .split(/\r?\n/)
    .map((line) => {
      if (insidePythonCodeBlock) {
        line = line.replace(/^      #/, '      ');
        quotationMarksSeen += /^      """/.test(line) ? 1 : 0;
        insidePythonCodeBlock = quotationMarksSeen < 2;
      } else {
        quotationMarksSeen = 0;
        insidePythonCodeBlock = /(Given|And) a file named ".+\.py"/i.test(line);
      }
      return line;
    })
    .join('\n');
}


// create a temporary directory and init an npm package there
const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dredd-hooks-template-test-'));
run('npm', ['init', '--yes'], { cwd: testDir });

// run 'npm pack' in the 'dredd-hooks-template' project directory and install
// the template from the resulting tarball as a dev dep in the test package
const projectDir = path.join(__dirname, '..');
run('npm', ['pack'], { cwd: projectDir });
const tgzBasename = `${packageData.name}-${packageData.version}.tgz`;
const tgzPath = path.join(projectDir, tgzBasename);
run('npm', ['install', tgzPath, '--save-dev'], { cwd: testDir });

// initialize the test suite template
run('npx', ['dredd-hooks-template', 'init'], { cwd: testDir });

// make custom changes to the '*.feature' files so they're able to test
// the Python hooks (reference implementation)
glob.sync(path.join(testDir, '**/*.feature')).forEach((featurePath) => {
  const content = fs.readFileSync(featurePath, { encoding: 'utf-8' });
  const modifiedContent = uncommentPythonCodeBlocks(replacePlaceholders(content));
  fs.writeFileSync(featurePath, modifiedContent, { encoding: 'utf-8' });
});

// run 'dredd-hooks-template test', should pass
run('npx', ['dredd-hooks-template', 'test'], { cwd: testDir });

// cleanup (intentionally doesn't cleanup on exception, as then one can 'cd'
// to the temporary directory and play with it to debug problems)
fs.removeSync(testDir);
