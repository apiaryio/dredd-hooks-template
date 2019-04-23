const { expect } = require('chai');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const which = require('which');
const childProcess = require('child_process');
const { Given, When, Then, Before, After } = require('cucumber');


Before(function () {
  this.dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dredd-hooks-template-'));
  this.env = { ...process.env };
});

After(function () {
  fs.remove(this.dir);
});


Given(/^I have "([^"]+)" command installed$/, function (command) {
  which.sync(command); // throws if the command is not found
});

Given(/^a file named "([^"]+)" with:$/, function (filename, content) {
  fs.writeFileSync(path.join(this.dir, filename), content);
});

Given(/^I set the environment variables to:$/, function (env) {
  this.env = { ...this.env, ...env.rowsHash() };
});


When(/^I run `([^`]+)`$/, function (command) {
  this.proc = childProcess.spawnSync(command, [], {
    shell: true,
    cwd: this.dir,
    env: this.env,
  });
});


Then('the exit status should be {int}', function (number) {
  expect(this.proc.status).to.equal(parseInt(number, 10));
});

Then('the output should contain:', function (output) {
  expect(this.proc.stdout.toString() + this.proc.stderr.toString()).to.contain(output);
});
