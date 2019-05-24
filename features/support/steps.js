const os = require('os');
const path = require('path');
const util = require('util');
const childProcess = require('child_process');
const { expect } = require('chai');
const fs = require('fs-extra');
const net = require('net');
const which = require('which');
const kill = require('tree-kill');
const { Given, When, Then, Before, After } = require('cucumber');

const DREDD_BIN = path.join(process.cwd(), 'node_modules', '.bin', 'dredd');


Before(function () {
  this.dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dredd-hooks-template-'));
  this.env = { ...process.env };
  this.commands = [];
  this.dataSent = '';
});

After(async function () {
  fs.remove(this.dir);
  await util.promisify(kill)(this.proc.pid);
});


Given(/^I have "([^"]+)" command installed$/, function (match) {
  const command = match === 'dredd'
    ? DREDD_BIN
    : match;
  which.sync(command); // throws if the command is not found
});

Given(/^a file named "([^"]+)" with:$/, function (filename, content) {
  fs.writeFileSync(path.join(this.dir, filename), content);
});

Given(/^I set the environment variables to:$/, function (env) {
  this.env = { ...this.env, ...env.rowsHash() };
});


When(/^I run `([^`]+)`$/, function (match) {
  const command = match.replace(/^dredd(?= )/, DREDD_BIN);
  this.proc = childProcess.spawnSync(command, [], {
    shell: true,
    cwd: this.dir,
    env: this.env,
  });
});

When(/^I run `([^`]+)` interactively$/, function (command) {
  this.proc = childProcess.spawn(command, [], {
    shell: true,
    cwd: this.dir,
    env: this.env,
  });
});

When('I wait for output to contain {string}', function (output, callback) {
  const proc = this.proc;

  function read(data) {
    if (data.toString().includes(output)) {
      proc.stdout.removeListener('data', read);
      proc.stderr.removeListener('data', read);
      callback();
    }
  }

  proc.stdout.on('data', read);
  proc.stderr.on('data', read);
});

When('I connect to the server', async function () {
  this.socket = new net.Socket();
  const connect = util.promisify(this.socket.connect.bind(this.socket));
  await connect(61321, '127.0.0.1');
});

When('I send a JSON message to the socket:', function (message) {
  this.socket.write(message);
  this.dataSent += message;
});

When('I send a newline character as a message delimiter to the socket', function () {
  this.socket.write('\n');
});


Then('the exit status should be {int}', function (status) {
  expect(this.proc.status).to.equal(status);
});

Then('the output should contain:', function (output) {
  expect(this.proc.stdout.toString() + this.proc.stderr.toString()).to.contain(output);
});

Then('it should start listening on localhost port {int}', async function (port) {
  this.socket = new net.Socket();
  const connect = util.promisify(this.socket.connect.bind(this.socket));
  await connect(port, '127.0.0.1'); // throws if there's an issue
  this.socket.end();
});

Then('I should receive the same response', function (callback) {
  this.socket.on('data', (data) => {
    const dataReceived = JSON.parse(data.toString());
    const dataSent = JSON.parse(this.dataSent);
    expect(dataReceived).to.deep.equal(dataSent);
    callback();
  });
});

Then('I should be able to gracefully disconnect', function () {
  this.socket.end();
});
