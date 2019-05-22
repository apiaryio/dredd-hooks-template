#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

const run = require('./run');
const copyFeatures = require('./copyFeatures');
const replaceDredd = require('./replaceDredd');


PROJECT_DIR = process.cwd();
NODE_MODULES_DIR = path.join(PROJECT_DIR, 'node_modules');

FEATURES_SRC_DIR = path.join(NODE_MODULES_DIR, 'dredd-hooks-template', 'features');
FEATURES_DIR = path.join(PROJECT_DIR, 'features');
STEPS_DIR = path.join(FEATURES_SRC_DIR, 'support');

NODE_BIN = process.execPath;
DREDD_BIN = path.join(NODE_MODULES_DIR, '.bin', 'dredd');
CUCUMBER_BIN = path.join(NODE_MODULES_DIR, '.bin', 'cucumber-js');


function init() {
  // create a 'features' directory in the project we're initializing
  fs.mkdirSync(FEATURES_DIR);

  // copy '*.feature' files from the template to the project, process each
  // file so it references the right Dredd executable
  copyFeatures(FEATURES_SRC_DIR, FEATURES_DIR, ({ basename, content }) => (
    {
      basename,
      content: replaceDredd(content, DREDD_BIN),
    }
  ));
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
  const packageData = JSON.parse(fs.readFileSync(packageDataPath, { encoding: 'utf-8' }));
  const currentVersion = packageData.devDependencies['dredd-hooks-template'];

  // ask npm about the latest published version of the 'dredd-hooks-template'
  // package
  const proc = run('npm', ['view', 'dredd-hooks-template', 'version'], { cwd: PROJECT_DIR });
  const version = proc.stdout.toString().trim();

  // halt in case the project already depends on the latest version
  if (currentVersion === version) {
    console.log(`The test suite template is up to date!`);
    return;
  }

  // upgrade the package
  const package = `dredd-hooks-template@${version}`;
  run('npm', ['install', package, '--save-dev'], { cwd: PROJECT_DIR });

  // copy '*.feature' files from the upgraded 'dredd-hooks-template' package
  // to the project, but don't overwrite the existing feature files, add these
  // as new ones, suffixed with the 'dredd-hooks-template' version
  copyFeatures(FEATURES_SRC_DIR, FEATURES_DIR, ({ basename, content }) => (
    {
      basename: `${basename}~${version}`,
      content: replaceDredd(content, DREDD_BIN),
    }
  ));
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
    console.error('See https://github.com/apiaryio/dredd-hooks-template README')
  }
}
