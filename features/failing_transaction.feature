Feature: Failing a transaction

  Background:
    Given I have Dredd installed
    And a file "server.js" with a server responding on "http://localhost:4567/message" with "Hello World!"
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
    When I run `dredd ./apiary.apib http://localhost:4567 --server="node server.js" --language="{{my-executable-path}}" --hookfiles=./hookfile.{{my-extension}} --loglevel=debug`
    Then the exit status should be 1
    And the output should contain:
      """
      Yay! Failed!
      """
