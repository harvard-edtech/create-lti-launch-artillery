// Import libs
const path = require('path');
const oauth = require('oauth-signature');
const open = require('open');
const osaScript = require('node-osascript');

// Import helpers
const genLTILaunch = require('./genLTILaunch');
const prompt = require('./prompt');
const print = require('./print');

// Import launch data
const launchData = require('../launchData');

// Import constants
const PORT = require('../constants/PORT');

// Extract launch data
const {
  course,
  app,
  canvasHost,
} = launchData;
const launchURL = app.launchURL.trim();
const consumerKey = app.consumerKey.trim();
const consumerSecret = app.consumerSecret.trim();

/**
 * Run an applescript
 * @author Gabe Abrams
 * @async
 * @param {string} script - the applescript to run
 */
const runApplescript = async (script) => {
  return new Promise((resolve, reject) => {
    osaScript.execute(script, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/**
 * Add routes needed then perform launches
 * @author Gabe Abrams
 * @param {ExpressApp} app - the express app to add routes to
 */
module.exports = async (app) => {
  /* ------------------------  Prep Browser ----------------------- */

  // Get the browser
  let browser;
  let usingSafari;
  try {
    browser = require('../browser');
  } catch (err) {
    try {
      browser = 'safari';
      usingSafari = true;
    } catch (err2) {
      if (err2.message.includes('osascript is not allowed to send keystrokes')) {
        console.log('\n\nOops! Once you\'ve given us access to automate, retry the test.');
        process.exit(0);
      }

      throw err2;
    }
  }

  /* --------------------- Get Range of Users --------------------- */

  // Ask the user which users to launch as
  console.log('\n\n');
  print.title('LTI Launch Artillery');

  console.log(`\nSpecify a range of users to test with: (e.g. 1-${launchData.users.length})`);
  const range = (await prompt()) || `1-${launchData.users.length}`;
  const parts = range.split('-');
  if (
    !parts.length === 2
    || Number.isNaN(Number.parseInt(parts[0]))
    || Number.isNaN(Number.parseInt(parts[1]))
  ) {
    console.log('\nOops! That\'s not a valid student range. Exiting');
    process.exit(1);
  }
  const startIndex = Number.parseInt(parts[0]) - 1;
  const endIndex = Number.parseInt(parts[1]);

  // Get just those users
  const users = [];
  for (let i = startIndex; i < endIndex; i++) {
    users.push(launchData.users[i]);
  }

  /* ---------------- Asynchronous Progress Tracker --------------- */

  let numDone = 0;

  /**
   * Mark one launch as done
   * @author Gabe Abrams
   */
  const onDone = async () => {
    numDone += 1;

    console.log(`> Progress: ${numDone}/${users.length}`);

    if (numDone >= users.length) {
      // Wait for a moment so requests can evaluate
      await new Promise((r) => { setTimeout(r, 4000); });

      // Finish
      console.log('');
      print.title('Done!');
      process.exit(0);
    }
  };

  /* --------------------- Launch Express Path -------------------- */

  app.get('/launch/:index', (req, res) => {
    const index = Number.parseInt(req.params.index) - 1;

    // Get user
    const user = users[index];

    // Get the LTI launch body
    const launchBody = genLTILaunch({
      course,
      user,
      app,
      canvasHost,
    });

    // Sign the launch body
    // > Add consumer id
    launchBody.oauth_consumer_key = consumerKey;

    // Convert everything in launch body to strings
    Object.keys(launchBody).forEach((key) => {
      launchBody[key] = String(launchBody[key]);
    });

    // Create signature
    launchBody.oauth_signature = decodeURIComponent(
      oauth.generate(
        'POST',
        launchURL,
        launchBody,
        consumerSecret
      )
    );

    // Mark the launch as done
    onDone();

    // Render a page that immediately does a POST redirect
    return res.render(
      path.join(__dirname, '../views/launchPage'),
      { launchBody, launchURL }
    );
  });

  /* -------------------- Open Window and Tabs -------------------- */

  if (usingSafari) {
    // Prep Safari
    await runApplescript('tell application "Safari" to activate');
    await runApplescript('tell application "System Events" to keystroke "N" using command down');
  }

  for (let index = 1; index <= users.length; index++) {
    const url = `http://localhost:${PORT}/launch/${index}`;

    await open(
      url,
      browser
    );
  }
};
