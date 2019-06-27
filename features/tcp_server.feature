Feature: TCP server

  Background:
    Given I have Dredd installed
    And a file named "apiary.apib" with:
      """
      # My Api
      ## GET /message
      + Response 200 (text/plain)

      Hello World!
      """
    And a file "server.js" with a server responding on "http://localhost:4567/message" with "Hello World!"
    And a file named "hookfile.{{my-extension}}" with:
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
      #    print('All works!')
      """

  Scenario: Listening on a default port
    When I run `{{my-executable-path}}` interactively
    And I wait for output to contain "Starting"
    Then it should start listening on 127.0.0.1 port 61321

  Scenario: Communicating on a default port
    When I run `dredd ./apiary.apib http://localhost:4567 --server="node server.js" --language="{{my-executable-path}}" --hookfiles=./hookfile.{{my-extension}} --loglevel=debug`
    Then the exit status should be 0
    And the output should contain:
      """
      All works!
      """

  Scenario: Listening on a custom port
    When I run `{{my-executable-path}} --port=4242` interactively
    And I wait for output to contain "Starting"
    Then it should start listening on 127.0.0.1 port 4242

  Scenario: Communicating on a custom port
    When I run `dredd ./apiary.apib http://localhost:4567 --server="node server.js" --language="{{my-executable-path}}" --hookfiles=./hookfile.{{my-extension}} --hooks-worker-handler-port=4242 --loglevel=debug`
    Then the exit status should be 0
    And the output should contain:
      """
      All works!
      """
