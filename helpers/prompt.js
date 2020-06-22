const promptSync = require('prompt-sync')();

/**
 * Displays a prompt, exits with ctrl+c
 * @param {string} text - text to display before the cursor
 * @param {boolean} isRequired - if true, this is a required field
 * @return {string} value typed by user
 */
module.exports = (text, isRequired) => {
  let ret;
  while (
    ret === undefined
    || (!ret && isRequired)
  ) {
    ret = promptSync(text);
    if (ret === null) {
      process.exit(0);
    }
    if (ret.trim().length === 0 && isRequired) {
      console.log('Oops! This field is required.\n');
      ret = null;
    }
  }
  return ret;
};
