# di-ipv-atp-playbox

This app is a GDS compliant NodeJS, Express and Nunjucks stack app.

### Index

- [Installation](#installation)
  - [Clone](#clone)
  - [Install Dependencies](#install-dependencies)
- [Run Web App](#run-web-app)
  - [Development](#development)
  - [Build](#build)
  - [Start](#start)
- [Testing](#testing)
  - [Unit](#unit)
  - [Coverage](#coverage)
  - [E2E](#e2e)
  - [Linting](#linting)
- [Structure](#structure)
  - [Overview](#overview)
  - [App](#app)
- [Translations](#translations)
  - [Extracting Latest](#extracting-latest)
  - [Importing CSV fron Excel](#importing-csv)
- [License](#license)

## Installation

### Clone

> Clone this repo to your local machine

```shell script
git clone git@github.com:alphagov/di-ipv-atp-playbox
```

Clones the repository to the `<your_folder_name` directory.

### Install dependencies

> To install dependencies, run yarn install

```shell script
yarn install
```

Installs the dependencies required to run the application.

## Run web app

### Environment variables

The web app requires environment variables set up for Cognito and the API. The `.env.sample` file needs to updated with their respective values:

- SESSION_SECRET - session secret (dev can use any random string)
- SESSION_COOKIE_MAX_AGE - session cookie max age (dev can use 120000)
- SESSION_COOKIE_SECURE - true or false (dev can use false)
- LOG_SESSION - true or false
- REDIS_SESSION_URL - Redis URL (de use 127.0.0.1)
- REDIS_PORT - Redis Port - Redis default is 6379
- REDIS_AUTH_TOKEN - Redis auth token (not required for localhost dev)

Then rename the file `.env.sample` to `.env`.

### Development

> To run the app in development mode with nodemon watching the files

```shell script
yarn dev
```

Starts a nodemon server serving the files from the `app/`
directory.

### Build

> To build the app

```shell script
yarn build
```

This will build the application using webpack and
`webpack/webpack.prod.js` configurations, generating
a build directory in the root directory.

### Start

> To run the built app

```shell script
yarn start
```

Starts a node server pointing to the entry point found in
the build directory.

## Testing

The unit tests have been written with Mocha. The end to end tests are using CodeceptJS with Gherkin due
to a better cross-browser testing support.

### Unit

> To run the unit tests

```shell script
yarn test:unit
```

Runs all unit tests found in the `test/unit/` directory
using mocha.

### Coverage

> To get a coverage report

```shell script
yarn test:coverage
```

Generates a coverage report using nyc which can be found in `test/coverage/`
directory.

### E2E

> To run end to end tests

```shell script
yarn test:e2e
```

Runs all end to end tests using CodeceptJS, any
artifacts generated are stored in the `functional-output/`
directory.

### Linting

> To run lint checks

```shell script
yarn lint
```

Checks if the code conforms the linting standards.

## Structure

### Overview

| Directory  | Description                                                        |
| ---------- | ------------------------------------------------------------------ |
| `app/`     | Contains the core business logic and the express app.              |
| `client/`  | Stores any client sided business logic such as the cookie checker. |
| `locale/`  | Contains the JSON files for content for internalization.           |
| `test/`    | Holds all of the tests.                                            |
| `types/`   | Type definitions stored here for testing purposes.                 |
| `views/`   | Contains the Nunjucks templates.                                   |
| `webpack/` | Contains the webpack configurations.                               |

### App

| Item                | Description                                                                     |
| ------------------- | ------------------------------------------------------------------------------- |
| `app/assets/`       | Holds images and SCSS files.                                                    |
| `app/controllers/`  | Contains the express controllers.                                               |
| `app/handlers/`     | Contains the handlers used for the express app, such as the `error-handlers`.   |
| `app/middleware/`   | Contains the middleware logic used in the express app.                          |
| `app/utils/`        | Utility functions go here.                                                      |
| `app/app.ts`        | Sets up and returns a configured express app.                                   |
| `app/app-config.ts` | Configuration functions for express app.                                        |
| `app/paths.ts`      | The paths for the app.                                                          |
| `app/routes.ts`     | Router configuration which initialises controllers and adds them to the router. |
| `app/server.ts`     | Entry point of the app, sets up a logger and starts the express server.         |

## Translations

Translations are stored in json files in the `locale` folder
each language is kept in JSON format inside language code folder/file

e.g. English locale/en/translation.json, Welsh locale/cy/translation.json, etc.

### Extracting Latest

A latest translation.csv can be extracted from the the locale/en/translation.json using the following node script

`node generate-flat-translation-file.js`

This will generate a key/value file:

`locale/en/translation.json`

This should be given to the translator who can import the file into Excel and add an additional column (with the header value of the language code they are translating to e.g. 'fr') to add thier translations to

The translator should translate all text and keep all html tags (e.g. `<strong>` in the translation, in addition any text in double curly brackets e.g. `{{url}}` should be in the translation as these are used for programmatic interpolation.

### Importing CSV fron Excel

**Always backup translation.json files before attempting to update the translations**

The file will need to be checked to make sure it is the correct format that the import scripts will understand.

The CSV file should be the following format:

- Delimiter: , (comma)
- QuoteChar: " (double quote)
- EscapeChar: " (double quote)
- All fields should be quoted

Excel sometimes has issues exporting accents and special characters, and will only conditionally wrap each column in double quotes.

One solution is to export the file as UTF-16 Unicode Text (txt), this will be delimited with tabs and preserve special characters.

The 'Edit CSV' extension (janisdd.vscode-edit-csv) in Visual Studio Code can be used to save the required format.

Load the file, click on 'Edit as csv' in the top bar, open 'Read Options Write Options' drop down and save with the following 'Write options':

- Delimiter: , (comma)
- QuoteChar: " (double quote)
- EscapeChar: " (double quote)
- Quote All Fields: true

Once saved reopen the file in VSCode and 'Save with Encoding' -> 'UTF-8'

_The file should now be ready for importing_

Import the file with the following command

`node import-translation-file.js {filename}`

On importing the file it will produce some output in the console and up to 2 csv files

`[error] key:pages.emailAddress.title missing from translation file`

...

`[error] key:pages.emailAddress.validationError.emailNotValid missing from translation file`

`Number of translations processed: 614`

`Number of missing translations: 163`

`Number of potential re-translations: 0`

`[translation] locale/cy/translation.json generated successfully.`

`[translation] translation-missing-cy.csv generated successfully.`

`[translation] translation-different-cy.csv generated successfully.`

translation-missing-{language}.csv contains all the keys and English values that did not have a translation in the imported file.

translation-different-{language}.csv contains all the keys and English values and translations where the English value is different to the imported file.

these files can be updated and used to update the import CSV using the following command (only the lines marked as 'done' in the reason column will be updated in the import file):

`node update-translation-file.js {translation-filename} {missing/different-filename}}.csv`

This updated file can then be re-imported into the system (updating the translation.json file for that language)

thse steps can be repeated until the import reports no missing translations or re-translations.

### Troubleshooting

### Having trouble signing in

A few tips that may help..

1. Make sure your credentials are listed in the Cognito user pool
2. During development, make sure you're connected to the authorised VPN
3. Check the configurations within the file `config/default.json` are pointing to the latest

## License

The haulier web app is made available under the [Apache 2.0 license](https://github.com/TransformCore/fb-smart-freight-haulier-web-app/blob/master/LICENSE).
