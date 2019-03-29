Feature: Failing a transaction

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
    When I run `dredd ./apiary.apib http://localhost:4567 --server="ruby server.rb" --language="dredd-hooks-{{mylanguage}}" --hookfiles=./hookfile.{{myextension}} --loglevel=debug`
    Then the exit status should be 1
    And the output should contain:
      """
      Yay! Failed!
      """
