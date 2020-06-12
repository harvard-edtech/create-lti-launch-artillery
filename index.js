const initCACCL = require('caccl/script');

// Import script
const script = require('./script');

// Import helpers
const prompt = require('./helpers/prompt');

const main = async () => {
  // Call script
  try {
    await script(prompt);
  } catch (err) {
    // Print error
    /* eslint-disable no-console */
    console.log('\nAn error occurred while running your script:');
    console.log(err);
  }
};

// Start main
main().catch(console.log);
