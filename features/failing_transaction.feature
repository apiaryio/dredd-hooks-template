Feature: Failing a transaction

  Background:
    Given I have "dredd-hooks-{{mylanguage}}" command installed
    And I have "dredd" command installed
    And a file named "server.js" with:
      """
      require('http')
        .createServer((req, res) => {
          if (req.url === '/message') {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Hello World!\n');
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
    Given a file named "hookfile.{{myextension}}" with:
      """
      ## Implement before hook failing the transaction by setting string 'Yay! Failed!' as value of key 'fail'
      ## in the transaction object
      ##
      ## So, replace following pseudo code with yours:
      #
      #import hooks
      #
      #@hooks.before('/message > GET')
      #def before(transaction):
      #    transaction['fail'] = 'Yay! Failed!'
      """
    When I run `dredd ./apiary.apib http://localhost:4567 --server="node server.js" --language="dredd-hooks-{{mylanguage}}" --hookfiles=./hookfile.{{myextension}} --loglevel=debug`
    Then the exit status should be 1
    And the output should contain:
      """
      Yay! Failed!
      """
