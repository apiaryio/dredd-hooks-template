#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

const run = require('./run');
const copyFeatures = require('./copyFeatures');


const PROJECT_DIR = process.cwd();
const NODE_MODULES_DIR = path.join(PROJECT_DIR, 'node_modules');

const FEATURES_SRC_DIR = path.join(NODE_MODULES_DIR, 'dredd-hooks-template', 'features');
const FEATURES_DIR = path.join(PROJECT_DIR, 'features');
const STEPS_DIR = path.join(FEATURES_SRC_DIR, 'support');

const NODE_BIN = process.execPath;
const CUCUMBER_BIN = path.join(NODE_MODULES_DIR, '.bin', 'cucumber-js');


function init() {
  // create a 'features' directory in the project we're initializing
  fs.mkdirSync(FEATURES_DIR);

  // copy '*.feature' files from the template to the project
  copyFeatures(FEATURES_SRC_DIR, FEATURES_DIR);
}


function test() {
  // use cucumber executable installed with the template package and run it
  // with the 'features' directory in the project (also use steps from
  // the template package)
  run(NODE_BIN, [CUCUMBER_BIN, FEATURES_DIR, '--require', STEPS_DIR], { cwd: PROJECT_DIR });
}


function upgrade() {
  // read the project's package.json and get currently installed version
  // of the 'dredd-hooks-template' package
  const packageDataPath = path.join(PROJECT_DIR, 'package.json');
  const packageData = JSON.parse(fs.readFileSync(packageDataPath, 'utf8'));
  const currentVersion = packageData.devDependencies['dredd-hooks-template'];

  // ask npm about the latest published version of the 'dredd-hooks-template'
  // package
  const proc = run('npm', ['view', 'dredd-hooks-template', 'version'], {
    cwd: PROJECT_DIR,
    stdio: 'pipe',
  });
  const version = proc.stdout.toString().trim();

  // halt in case the project already depends on the latest version
  if (currentVersion === version) {
    console.log('The test suite template is up to date!');
    return;
  }

  // upgrade the package
  const pkg = `dredd-hooks-template@${version}`;
  run('npm', ['install', pkg, '--save-dev', '--save-exact'], { cwd: PROJECT_DIR });

  // copy '*.feature' files from the upgraded 'dredd-hooks-template' package
  // to the project, but don't overwrite the existing feature files, add these
  // as new ones, suffixed with the 'dredd-hooks-template' version
  copyFeatures(FEATURES_SRC_DIR, FEATURES_DIR, basename => `${basename}~v${version}`);

  // inform user about what has just happened and what's the next step
  console.log(`\
The test suite template has been upgraded. New feature files have been copied
to the 'features' directory, suffixed with '~v${version}'. Please go through
them manually and update your test suite with the latest changes. Seeing the
changes on GitHub might help as well:

https://github.com/apiaryio/dredd-hooks-template/compare/v${currentVersion}...v${version}
`);
}


// poor man's CLI implementation (it's just three commands, so not worth
// a dedicated library)
if (process.argv.length > 3) {
  process.exitCode = 1;
  console.error('Wrong number of arguments');
} else {
  const command = process.argv[2];
  if (command === 'init') {
    init();
  } else if (command === 'test') {
    test();
  } else if (command === 'upgrade') {
    upgrade();
  } else {
    process.exitCode = 1;
    console.error('Available commands: init, test, upgrade');
    console.error('See https://github.com/apiaryio/dredd-hooks-template README');
  }
}
