Feature: Failing a transacstion

  Background:
    Given I have "dredd-hooks-{{mylanguage}}" command installed
    And I have "dredd" command installed
    And a file named "server.rb" with:
      """
      require 'sinatra'
      get '/message' do
        "Hello World!\n\n"
      end
      """

    And a file named "apiary.apib" with:
      """
      # My Api
      ## GET /message
      + Response 200 (text/html;charset=utf-8)
          Hello World!
      """

  @debug
  Scenario:
    Given a file named "hookfile.{{myextension}}" with:
      """
      ## Implement before hook failing the tranasction by setting string 'Yay! Failed!' as value of key 'fail'
      ## in the transaction object
      ##
      ## So, replace following pseudcode with yours:
      #
      #require 'mylanguagehooks'
      #
      #before("/message > GET") { |transaction|
      #  transaction['fail'] == 'Yay! Failed!'
      #}
      #
      """
    When I run `dredd ./apiary.apib http://localhost:4567 --server "ruby server.rb" --language "dredd-hooks-{{mylanguage}}" --hookfiles ./hookfile.{{myextension}}`
    Then the exit status should be 1
    And the output should contain:
      """
      Yay! Failed!
      """
