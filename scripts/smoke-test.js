const os = require('os');
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const which = require('which');

const packageData = require('../package');
const run = require('../cli/run');


function replacePlaceholders(content, handlerCommand = 'dredd-hooks-python') {
  return content
    .replace(/\{\{my-executable-path\}\}/g, handlerCommand)
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
        line = line.replace(/^ {6}#/, '      '); // eslint-disable-line no-param-reassign
        quotationMarksSeen += /^ {6}"""/.test(line) ? 1 : 0;
        insidePythonCodeBlock = quotationMarksSeen < 2;
      } else {
        quotationMarksSeen = 0;
        insidePythonCodeBlock = /(Given|And) a file named ".+\.py"/i.test(line);
      }
      return line;
    })
    .join('\n');
}

// https://en.wikipedia.org/wiki/Shebang_(Unix)
function parseShebang(contents) {
  const shebang = contents.toString().split(/[\r\n]+/)[0];
  return shebang.replace(/^#!/, '');
}


/* ****************************************************************************
  SET UP
**************************************************************************** */

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


/* ****************************************************************************
  INITIALIZE & TEST
**************************************************************************** */

// initialize the test suite template
run('npx', ['dredd-hooks-template', 'init'], { cwd: testDir });

// find out what is the relative path to the Python hooks executable so
// we can use it in the test suite (with Python hooks this is not necessary,
// plain 'dredd-hooks-python' would work fine, but we want to test here that
// relative paths and complex commands work with the test suite)
//
// (instead of 'dredd-hooks-python', the handler command is going to be
// something like '../…/bin/python ../…/bin/dredd-hooks-python')
const executablePath = which.sync('dredd-hooks-python');
const pythonPath = parseShebang(fs.readFileSync(executablePath));
const relativeBase = path.join(testDir, 'package.json');
const handlerCommand = `${path.relative(relativeBase, pythonPath)} ${path.relative(relativeBase, executablePath)}`;

// make custom changes to the '*.feature' files so they're able to test
// the Python hooks (reference implementation)
glob.sync(path.join(testDir, '**/*.feature')).forEach((featurePath) => {
  const content = fs.readFileSync(featurePath, 'utf8');
  const modifiedContent = uncommentPythonCodeBlocks(replacePlaceholders(content, handlerCommand));
  fs.writeFileSync(featurePath, modifiedContent, 'utf8');
});

// run 'dredd-hooks-template test', should pass
run('npx', ['dredd-hooks-template', 'test'], { cwd: testDir });


/* ****************************************************************************
  UPGRADE
**************************************************************************** */

// pretend 'dredd-hooks-template' is in one of the previous versions
const projectPackagePath = path.join(testDir, 'package.json');
const projectPackageData = fs.readJSONSync(projectPackagePath);
projectPackageData.devDependencies['dredd-hooks-template'] = '1.0.0';
fs.writeJSONSync(projectPackagePath, projectPackageData);

// run 'dredd-hooks-template upgrade'
const output = run('npx', ['dredd-hooks-template', 'upgrade'], {
  cwd: testDir,
  stdio: 'pipe',
}).stdout.toString();

// the upgrade output should contain hints
const containsHint = output.includes('copied') && output.includes('suffixed') && output.includes('manually');
if (!containsHint) throw new Error("Output of 'dredd-hooks-template upgrade' doesn't include hint text");

// the upgrade output should contain a link to the relevant GitHub diff
const containsLink = output.includes('https://github.com/apiaryio/dredd-hooks-template/compare/v1.0.0...');
if (!containsLink) throw new Error("Output of 'dredd-hooks-template upgrade' doesn't include link to GitHub");

// the upgrade should copy the newest files over with suffixed extensions
const filesCopied = glob.sync(path.join(testDir, '**/*.feature~v*')).length;
if (!filesCopied) throw new Error("Running 'dredd-hooks-template upgrade' didn't copy feature files");


/* ****************************************************************************
  TEAR DOWN
**************************************************************************** */

// cleanup (intentionally doesn't cleanup on exception, as then one can 'cd'
// to the temporary directory and play with it to debug problems)
fs.removeSync(testDir);
