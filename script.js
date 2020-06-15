const initCACCL = require('caccl/script');
const opn = require('opn');

// Import constants
const tokens = require('./studentAccessTokens');

// Import helpers
const print = require('./helpers/print');

module.exports = async (prompt) => {
  print.title('Gathering Required Info');

  // Get the canvasHost
  print.subtitle('Enter a Canvas Host');
  print.centered('e.g. canvas.harvard.edu');
  const canvasHost = (await prompt()) || 'canvas.harvard.edu';
  console.log(`\nUsing: ${canvasHost}\n`);
  
  // Get courseId
  print.subtitle('Enter a Canvas Course Id');
  print.centered('e.g. 72784');
  const courseId = Number.parseInt((await prompt()) || '72784');
  if (!courseId || Number.isNaN(courseId)) {
    console.log('\nOops! That\'s not a valid courseId. Exiting');
    process.exit(1);
  }
  console.log(`\nUsing: ${courseId}\n`);

  // Get the appId
  print.subtitle('Enter an AppId');
  print.centered('e.g. 63793');
  const appId = Number.parseInt((await prompt()) || '63793');
  if (!appId || Number.isNaN(appId)) {
    console.log('\nOops! That\'s not a valid appId. Exiting');
    process.exit(1);
  }
  console.log(`\nUsing: ${appId}\n`);

  // Get range of students
  print.subtitle(`There are ${tokens.length} students.`);
  print.subtitle('Which students do you want to test with?');
  print.centered(`e.g. 1-${tokens.length}`);
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
  console.log(`\nUsing: ${startIndex + 1} to ${endIndex}`);

  // Create apis
  const apiList = [];
  for (let i = startIndex; i < endIndex; i++) {
    apiList.push(initCACCL({
      canvasHost,
      accessToken: tokens[i],
    }));
  }

  print.title('Working...');

  print.centered('Gathering launch links');

  // Create launch links
  const tasks = apiList.map((api) => {
    return api.course.app.getNavLaunchURL({
      courseId,
      appId,
    });
  });

  const launchLinks = await Promise.all(tasks);

  print.title('Open a Private Window in Your Browser')
  print.centered('Press enter to continue');
  await prompt();

  console.log('');
  print.subtitle('Opening Links');

  for (let i = 0; i < launchLinks.length; i++) {
    const link = launchLinks[i];

    opn(link, { background: true, app: 'Google Chrome' }).catch((err) => {
      console.log(err.message);
    });

    await new Promise((r) => {
      setTimeout(r, 10);
    });
  }
};
