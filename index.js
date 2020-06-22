const initCACCL = require('caccl/script');
const express = require('express');

// Import helpers
const doLaunches = require('./helpers/doLaunches');

// Import constants
const PORT = require('./constants/PORT');

const main = async () => {
  // Create a server
  const app = express();

  // Set up ejs
  app.set('view engine', 'ejs');

  // Allow connections from localhost
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'localhost');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
  });

  // Start the server
  app
    .listen(PORT, async () => {
      // Start launches!
      try {
        await doLaunches(app);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log('\nOops! An issue has occurred:');
        // eslint-disable-next-line no-console
        console.log(err);
        process.exit(1);
      }
    })
    .on('error', (err) => {
      if (err.message.includes('EADDRINUSE')) {
        // Another version of the server is running!
        // eslint-disable-next-line no-console
        console.log('Oops! Another test script is still running.\n\nSolution:\nIn a terminal window, type "sudo lsof -ti tcp:8098 | xargs kill" and press enter\n');
        process.exit(0);
      }
      // eslint-disable-next-line no-console
      console.log(`Could not start launches because an error occurred: ${err.message}`);
    });
};

// Start main
main().catch(console.log);
