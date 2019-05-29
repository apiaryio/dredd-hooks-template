Feature: Multiple hook files with a glob

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
    Given a file named "hookfile1.{{my-extension}}" with:
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
    And a file named "hookfile2.{{my-extension}}" with:
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
    And a file named "hookfile_glob.{{my-extension}}" with:
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
    When I run `dredd ./apiary.apib http://localhost:4567 --server="node server.js" --language="{{my-executable-path}}" --hookfiles=./hookfile1.{{my-extension}} --hookfiles=./hookfile2.{{my-extension}} --hookfiles=./hookfile_*.{{my-extension}} --loglevel=debug`
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
