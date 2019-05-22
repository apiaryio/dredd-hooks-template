# Contributing

Clone the repository and install dependencies:

```
$ git clone "https://github.com/apiaryio/dredd-hooks-template.git"
$ cd ./dredd-hooks-template
$ npm install
```

## Smoke Test

There is a [smoke test](https://en.wikipedia.org/wiki/Smoke_testing_(software)), which ensures everything works as described in the tutorial above. It uses the [Python hooks handler](https://github.com/apiaryio/dredd-hooks-python) as the reference implementation, so have it installed:

```
$ pip install dredd_hooks
```

Then you can run the smoke test:

```
$ npm test
```

## Feature Files Linter

The feature files syntax is validated automatically. To perform the validation locally, use the `lint` script:

```
$ npm run lint
```

## Introducing Changes

The test suite uses the [Python hooks](https://github.com/apiaryio/dredd-hooks-python) as a reference implementation. To introduce a change to this test suite, follow these steps:

1.  Implement the new behavior in the Python hooks.
1.  Change the feature files living in the Python hooks repo to describe the new behavior. If needed, add a local `steps.js` file implementing missing test steps.
1.  Make sure the Python hooks pass that changed test suite.
1.  Release a new version of the Python hooks.
1.  Generalize the changed (or added) feature files with placeholders, comment-out the code examples, and copy the files over to this repository. Add missing test steps implementations to the `steps.js`. Create a Pull Request.
1.  Make sure the smoke test passes under the Pull Request.
1.  Merge the Pull Request and let Semantic Release to produce a new version of the test suite package.
1.  Go to Python hooks repository and [upgrade](README.md#upgrading) the test suite package there. Remove any local `steps.js` as the necessary steps should already be implemented in the new version of the test suite package.
1.  Go to Ruby hooks repository and [upgrade](README.md#upgrading) the test suite package there.
1.  Go to all remaining repositories with hooks handlers and issue Pull Requests for the maintainers which help them to kick-off the upgrade. It's okay if they're incomplete, their purpose is to advertise the changes, to initiate the upgrade, and to be helpful to the maintainers.
