Feature: Execution order

  Background:
    Given I have "{{my-executable-path}}" command installed
    And I have "dredd" command installed
    And a file named "server.js" with:
      """
      require('http')
        .createServer((req, res) => {
          if (req.url === '/message') {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Hello World!\n');
          } else {
            res.writeHead(500);
            res.end();
          }
        })
        .listen(4567);
      """

    And a file named "apiary.apib" with:
      """
      # My Api
      ## GET /message
      + Response 200 (text/plain)

              Hello World!
      """

  Scenario:
    Given a file named "hookfile.{{my-extension}}" with:
      """
      ## Implement following in your language utilizing each hook declaring function
      ## from API in your language:
      ## - create an array under  `hooks_modifications` key in transaction object if it doesn't exits
      ## - push to this array string with type of hook + "modification" e.g. "after modification"
      ##
      ## So, replace following pseudo code with yours:
      #
      #import hooks
      #
      #key = 'hooks_modifications'
      #
      #@hooks.before('/message > GET')
      #def before(transaction):
      #    transaction.setdefault(key, [])
      #    transaction[key].append('before modification')
      #
      #@hooks.after('/message > GET')
      #def after(transaction):
      #    transaction.setdefault(key, [])
      #    transaction[key].append('after modification')
      #
      #@hooks.before_validation('/message > GET')
      #def before_validation(transaction):
      #    transaction.setdefault(key, [])
      #    transaction[key].append('before validation modification')
      #
      #@hooks.before_all
      #def before_all(transactions):
      #    transactions[0].setdefault(key, [])
      #    transactions[0][key].append('before all modification')
      #
      #@hooks.after_all
      #def after_all(transactions):
      #    transactions[0].setdefault(key, [])
      #    transactions[0][key].append('after all modification')
      #
      #@hooks.before_each
      #def before_each(transaction):
      #    transaction.setdefault(key, [])
      #    transaction[key].append('before each modification')
      #
      #@hooks.before_each_validation
      #def before_each_validation(transaction):
      #    transaction.setdefault(key, [])
      #    transaction[key].append('before each validation modification')
      #
      #@hooks.after_each
      #def after_each(transaction):
      #    transaction.setdefault(key, [])
      #    transaction[key].append('after each modification')
      """
    And I set the environment variables to:
      | variable                       | value      |
      | TEST_DREDD_HOOKS_HANDLER_ORDER | true       |

    When I run `dredd ./apiary.apib http://localhost:4567 --server="node server.js" --language="{{my-executable-path}}" --hookfiles=./hookfile.{{my-extension}} --loglevel=debug`
    Then the exit status should be 0
    And the output should contain:
      """
      0 before all modification
      1 before each modification
      2 before modification
      3 before each validation modification
      4 before validation modification
      5 after modification
      6 after each modification
      7 after all modification
      """
