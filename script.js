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

  // Create apis
  const apiList = tokens.map((accessToken) => {
    return initCACCL({
      accessToken,
      canvasHost,
    });
  });

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

  print.title('Open a Private Window in Safari')
  print.centered('Press enter to continue');
  await prompt();

  console.log('');
  print.subtitle('Opening Links');

  for (let i = 0; i < 20; i++) {
    const link = launchLinks[i];
    opn(link, { background: true, app: 'Safari' });

    await new Promise((r) => {
      setTimeout(r, 50);
    });
  }
};
