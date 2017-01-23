# Dredd Cross Language Hooks Test Suite

[![Build Status](https://travis-ci.org/apiaryio/dredd-hooks-template.svg?branch=master)](https://travis-ci.org/apiaryio/dredd-hooks-template)

Language agnostic CLI test suite for boilerplating [Dredd hooks][dredd] handler in new language written in [Aruba][aruba].

  [aruba]: https://github.com/cucumber/aruba
  [dredd]: https://github.com/apiaryio/dredd

## Usage

### Install the features dependencies

```bash
npm install -g dredd
git clone https://github.com/apiaryio/dredd-hooks-template.git
cd dredd-hooks-template
bundle install
```

### Enable the features for your language

1. Open the feature files in `./features/*.feature`
1. In all of them, replace:
  - `{{mylanguage}}` by the hooks handler command for you language
  - `{{myextension}}` by the extension for your language
1. Implement the code examples in your language
1. Run the test suite: `bundle exec cucumber`

### Add the features to your project

If the test suite did run as expected, you can now add the features to your project.
To do so, copy to your project:

1. the entire `features/` directory
1. the `Gemfile`, `Gemfile.lock` and `.ruby-version`

Your should now be able to install the features dependencies and run the test suite in your project.

Finally, make `bundle exec cucumber` part of your test suite and CI (see `.travis.example.yml` if you are using [Travis CI][travis]).

  [travis]: https://travis-ci.org

## Development

The feature files syntax is validated automatically. To perform the validation locally:

```bash
# Install the dependencies
npm install

# Run the linter
./node_modules/gherkin-lint/src/main.js features/
```

## Examples

The [Dredd Hooks Ruby gem][ruby] and the [Dredd Hooks Python package][python] can be used as references to use this cross-language test suite.

  [ruby]: https://github.com/apiaryio/dredd-hooks-ruby
  [python]: https://github.com/apiaryio/dredd-hooks-python
