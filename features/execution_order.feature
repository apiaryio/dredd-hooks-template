Feature: Execution order

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

  Scenario:
    Given a file named "hookfile.{{myextension}}" with:
      """
      ## Implement following in your language utilizing each hook declaring function
      ## from API in your language:
      ## - create an array under  `hooks_modifications` key in transaction object if it doesn't exits
      ## - push to this array string with type of hook + "modification" e.g. "after modification"
      ##
      ## So, replace following pseudo code with yours:
      #
      #require 'mylanguagehooks'
      #
      #key = 'hooks_modifications'
      #
      #before("/message > GET") { |transaction|
      #  if(!transaction[key]?){ transaction[key] = [] }
      #  transaction[key].push "before modification"
      #}
      #
      #after("/message > GET") { |transaction|
      #  if(!transaction[key]?){ transaction[key] = [] }
      #  transaction[key].push "after modification"
      #}
      #
      #before_validation("/message > GET") { |transaction|
      #  if(!transaction[key]?){ transaction[key] = [] }
      #  transaction[key].push "before validation modification"
      #}
      #
      #before_all { |transaction|
      #  if(!transaction[key]?){ transaction[key] = [] }
      #  transaction[0][key].push "before all modification"
      #}
      #
      #after_all { |transaction|
      #  if(!transaction[key]?){ transaction[key] = [] }
      #  transaction[0][key].push "after all modification"
      #}
      #
      #before_each { |transaction|
      #  if(!transaction[key]?){ transaction[key] = [] }
      #  transaction[key].push "before each modification"
      #}
      #
      #before_each_validation { |transaction|
      #  if(!transaction[key]?){ transaction[key] = [] }
      #  transaction[key].push "before each validation modification"
      #}
      #
      #after_each { |transaction|
      #  if(!transaction[key]?){ transaction[key] = [] }
      #  transaction[key].push "after each modification"
      #}

      """
    Given I set the environment variables to:
      | variable                       | value      |
      | TEST_DREDD_HOOKS_HANDLER_ORDER | true       |

    When I run `dredd ./apiary.apib http://localhost:4567 --server "ruby server.rb" --language dredd-hooks-{{mylanguage}} --hookfiles ./hookfile.{{myextension}}`
    Then the exit status should be 0
    Then the output should contain:
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
