const { spawnSync } = require('child_process');


/**
 * Like 'spawnSync()', but prints the stdout/stderr of the subprocess
 * by default and throws in case the command failed
 */
module.exports = function run(command, args, options) {
  const proc = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (proc.error) throw proc.error;
  if (proc.status) throw new Error(`'${[command].concat(args).join(' ')}' failed`);
  return proc;
};
