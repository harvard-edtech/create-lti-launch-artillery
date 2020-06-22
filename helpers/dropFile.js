const prompt = require('./prompt');
const print = require('./print');
const clear = require('clear');
const fs = require('fs');

/**
 * @param {string} title - title of the file to drop
 * @return {string} contents of the file 
 */
module.exports = async (title) => {
  let contents;
  let errorMessage;

  while (!contents) {
    clear();

    // Error
    if (errorMessage) {
      print.title(`(!) ${errorMessage}`);
      await new Promise((r) => {
        setTimeout(r, 800);
      });
      console.log('');
    }
    
    // Drop zone
    print.title(`Drop ${title} File Here then Press Enter`);
    print.centered('...or ctrl + c to quit');
    const filename = prompt();
    console.log('');

    // Detect error
    if (!filename) {
      errorMessage = 'Oops! We didn\'t get a file. Please try again.';
    } else {
      // Try to read the file
      try {
        contents = fs.readFileSync(
          filename.trim(),
          'utf-8'
        );
      } catch (err) {
        errorMessage = 'Oops! That file is invalid. Please try again.';
      }
    }
  }

  clear();
  return contents;
};
