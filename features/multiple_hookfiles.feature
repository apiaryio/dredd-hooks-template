Feature: Multiple hook files with a glob

  Background:
    Given I have "dredd-hooks-{{mylanguage}}" command installed
    And I have "dredd" command installed
    And a file named "server.rb" with:
      """
      require 'sinatra'
      get '/message' do
        "Hello World!\n"
      end
      """

    And a file named "apiary.apib" with:
      """
      # My Api
      ## GET /message
      + Response 200 (text/html;charset=utf-8)

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
    When I run `dredd ./apiary.apib http://localhost:4567 --server="ruby server.rb" --language="dredd-hooks-{{mylanguage}}" --hookfiles=./hookfile1.{{myextension}} --hookfiles=./hookfile2.{{myextension}} --hookfiles=./hookfile_*.{{myextension}} --loglevel=debug`
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
