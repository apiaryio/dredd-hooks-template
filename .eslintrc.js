module.exports = {
  extends: 'airbnb-base',
  env: {
    'mocha': true,
    'node': true
  },
  rules: {
    // Using 'console' is perfectly okay for a Node.js CLI tool and avoiding
    // it only brings unnecessary complexity
    'no-console': 'off',
  }
};
