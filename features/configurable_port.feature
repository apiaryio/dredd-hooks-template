Feature: Configurable port

  Background:
    Given I have "dredd-hooks-php" command installed
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

  @announce
  Scenario:
    Given a file named "hookfile/.{{myextension}}" with:
      """
      ## So, replace following pseudo code with yours:
      #
      #require 'mylanguagehooks'
      #
      #key = 'hooks_modifications'
      #
      #before("/message > GET") { |transaction|
      #  puts 'listening on different port'
      #}
      """

    When I run `dredd ./apiary.apib http://localhost:4567 --hooks-worker-handler-port 61325 --server "ruby server.rb" --language "dredd-hooks-{{mylanguage}}" --hookfiles ./hookfile.{{myextension}}`
    Then the exit status should be 0
    And the output should contain:
      """
      listening on different port
      """
