# create-lti-launch-artillery

Summary: test developers create a test and then many testers will run that test all at once, each taking a range of the users. The test developer will end up creating a `launchData.json` file, which must be securely sent to testers.

## Instructions for Testers:

### Preparation:

1. Get the test file from the test creator
2. Install [Node.js](nodejs.org)

### Running Tests using the App (Mac Only):

1. Download and unzip [the LTIArtillery App](https://github.com/harvard-edtech/create-lti-launch-artillery/raw/master/LTIArtillery.zip)
2. Right click the app and select "Open"
3. Follow instructions

### Running Tests using Terminal:

1. Open Terminal
2. Run `npm init lti-launch-artillery`
3. Follow instructions

## Instructions for Test Creators:

To create a new test file, follow these instructions:

1. Open Terminal
2. Run `npm init lti-launch-artillery --new`
3. Follow instructions
