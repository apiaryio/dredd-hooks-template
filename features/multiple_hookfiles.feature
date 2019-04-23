Feature: Multiple hook files with a glob

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
    Given a file named "hookfile1.{{myextension}}" with:
      """
      ## Implement before hook writing to standard output text: "It's me, File1"
      ##
      ## So, replace following pseudo code with yours:
      #
      #import hooks
      #
      #@hooks.before('/message > GET')
      #def before(transaction):
      #    print("It's me, File1")
      """
    And a file named "hookfile2.{{myextension}}" with:
      """
      ## Implement before hook writing to standard output text: "It's me, File2"
      ##
      ## So, replace following pseudo code with yours:
      #
      #import hooks
      #
      #@hooks.before('/message > GET')
      #def before(transaction):
      #    print("It's me, File2")
      """
    And a file named "hookfile_glob.{{myextension}}" with:
      """
      ## Implement before hook writing to standard output text: "It's me, File3"
      ##
      ## So, replace following pseudo code with yours:
      #
      #import hooks
      #
      #@hooks.before('/message > GET')
      #def before(transaction):
      #    print("It's me, File3")
      """
    When I run `dredd ./apiary.apib http://localhost:4567 --server="node server.js" --language="dredd-hooks-{{mylanguage}}" --hookfiles=./hookfile1.{{myextension}} --hookfiles=./hookfile2.{{myextension}} --hookfiles=./hookfile_*.{{myextension}} --loglevel=debug`
    Then the exit status should be 0
    And the output should contain:
      """
      It's me, File1
      """
    And the output should contain:
      """
      It's me, File2
      """
    And the output should contain:
      """
      It's me, File3
      """
