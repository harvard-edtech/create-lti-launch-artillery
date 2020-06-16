// The name of your browser:
const BROWSER_NAME = (
  process.env.BROWSER
  || 'Safari'
);

const initCACCL = require('caccl/script');
const opn = require('opn');

// Import constants
const tokens = require('./studentAccessTokens');

// Import helpers
const print = require('./helpers/print');

module.exports = async (prompt) => {
  print.title(`Open a Private Window in ${BROWSER_NAME}`);
  print.centered('Press enter to continue');
  await prompt();

  print.title('Gathering Required Info');
  console.log('');

  // Get the canvasHost
  console.log('Canvas Host: (e.g. canvas.harvard.edu)');
  const canvasHost = (await prompt()) || 'canvas.harvard.edu';
  console.log(`> Using: ${canvasHost}\n`);
  
  // Get courseId
  console.log('Canvas CourseId: (e.g. 72784)');
  const courseId = Number.parseInt((await prompt()) || '72784');
  if (!courseId || Number.isNaN(courseId)) {
    console.log('\nOops! That\'s not a valid courseId. Exiting');
    process.exit(1);
  }
  console.log(`> Using: ${courseId}\n`);

  // Get the appId
  console.log('AppId: (e.g. 63793)');
  const appId = Number.parseInt((await prompt()) || '63793');
  if (!appId || Number.isNaN(appId)) {
    console.log('\nOops! That\'s not a valid appId. Exiting');
    process.exit(1);
  }
  console.log(`> Using: ${appId}\n`);

  // Get range of students
  console.log(`Student Range to Test: (e.g. 1-${tokens.length}`);
  const range = (await prompt()) || `1-${tokens.length}`;
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
  console.log(`> Using: ${startIndex + 1} to ${endIndex}`);

  // Create apis
  const apiList = [];
  for (let i = startIndex; i < endIndex; i++) {
    apiList.push(initCACCL({
      canvasHost,
      accessToken: tokens[i],
    }));
  }

  console.log('');
  print.title('Preparing...');

  // Create launch links
  const tasks = apiList.map((api) => {
    return api.course.app.getNavLaunchURL({
      courseId,
      appId,
    });
  });

  const launchLinks = await Promise.all(tasks);

  console.log('');
  print.title('Opening Sessions');

  for (let i = 0; i < launchLinks.length; i++) {
    const link = launchLinks[i];

    opn(link, {
      background: true,
      app: (
        ['chrome', 'google chrome'].indexOf(BROWSER_NAME.toLowerCase()) >= 0
          ? [
            'google-chrome',
            '--incognito',
            `--user-data-dir=~/tmp/foobar${i}`,
            '--no-first-run'
          ]
          : BROWSER_NAME
      ),
    }).catch((err) => {
      console.log(err.message);
    });

    await new Promise((r) => {
      setTimeout(r, 10);
    });
  }
};
