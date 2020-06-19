# lti-launch-artillery

Summary: test developers create a test and then many testers will run that test all at once, each taking a range of the users. The test developer will end up creating a `launchData.json` file, which must be securely sent to testers.

## Instructions for Testers:

### Preparation:

Before you start, you need to get a `launchData.json` file from the test developer.

1. Open Terminal
2. Use `cd` to get to a folder that test stuff can go into
3. Run `git clone https://github.com/harvard-edtech/lti-launch-artillery.git`
4. Run `cd lti-launch-artillery`
5. Run `open .`
6. Drag/drop the `launchData.json` file into the folder that popped up

### Verifying Your Setup:

1. Open Terminal
2. Use `cd` to get _inside of_ the `lti-launch-artillery` folder, wherever you put it
3. Run `npm test`
4. For the range, enter `1-1` so you're trying with just one user
5. If an authorization screen pops up, follow instructions to allow Terminal to control your computer

### Running Tests

1. Open Terminal
2. Use `cd` to get _inside of_ the `lti-launch-artillery` folder, wherever you put it
3. Run `npm test`
4. Add the range of users that the test developer gave you

## Instructions for Test Developers:

1. Clone the repo
2. Run `npm run build` and follow instructions
