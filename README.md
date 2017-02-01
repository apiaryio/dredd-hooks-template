# Cross-Language Test Suite for Dredd Hooks

[![Build Status](https://travis-ci.org/apiaryio/dredd-hooks-template.svg?branch=master)](https://travis-ci.org/apiaryio/dredd-hooks-template)

Language-agnostic BDD test suite for boilerplating implementation of [Dredd][] [hooks][] handler for a new language. It tests the public interface of the hooks handler and ensures it will work as Dredd expects. It's written in [Gherkin][] and ran by [Aruba][].

  [Aruba]: https://github.com/cucumber/aruba
  [Gherkin]: https://github.com/cucumber/cucumber/wiki/Gherkin
  [Dredd]: https://github.com/apiaryio/dredd
  [hooks]: https://dredd.readthedocs.io/en/latest/hooks/

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

## Maintenance

Updating Aruba regularly is not absolutely critical, but helps making sure that all Dredd hooks implementations behave the same.

In order to update your installation and ensure the same version is used accross all your environments, run `bundle update aruba` from time to time and commit the corresponding `Gemfile.lock` as part of the update.

## Development

The feature files syntax is validated automatically. To perform the validation locally:

```bash
# Install the dependencies
npm install

# Run the linter
npm test
```

## Examples

The [Dredd Hooks Ruby gem][ruby] and the [Dredd Hooks Python package][python] can be used as references to use this cross-language test suite.

  [ruby]: https://github.com/apiaryio/dredd-hooks-ruby
  [python]: https://github.com/apiaryio/dredd-hooks-python
