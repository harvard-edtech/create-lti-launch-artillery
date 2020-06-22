const prompt = require('./prompt');
const print = require('./print');
const fs = require('fs');
const path = require('path');
const initCACCL = require('caccl/script');
const dropFile = require('./dropFile');

/**
 * Build the launchData using a wizard
 * @author Gabe Abrams
 */
const run = async () => {
  /* ---------------------------- Intro --------------------------- */
  console.log('\n\n');
  print.title('Launch Data Builder');

  console.log('\nLet\'s create/overwrite your launchData.js file.');
  console.log('Enter to Continue');
  await prompt();

  /* ------------------------  Canvas Info ------------------------ */
  console.log('');
  print.subtitle('1. Canvas Info');

  const canvasHost = (await prompt('Canvas Host: ')) || undefined;

  /* ------------------------- Course Info ------------------------ */
  console.log('');
  print.subtitle('4. Course Info');

  const courseId = (await prompt('Course Canvas Id: ')) || undefined;
  const courseName = (await prompt('Course Name: ')) || undefined;
  const courseCode = (await prompt('Course Code: ')) || undefined;

  const course = {
    id: courseId,
    name: courseName,
    code: courseCode,
  };

  /* -------------------------- App Info -------------------------- */
  console.log('');
  print.subtitle('3. App Info');

  const appName = (await prompt('App Name: ')) || undefined;
  const launchURL = (await prompt('Launch URL: ')) || 'https://localhost/launch';
  const consumerKey = (await prompt('Consumer Key: ')) || 'consumer_key';
  const consumerSecret = (await prompt('Consumer Secret: ')) || 'consumer_secret';

  const app = {
    launchURL,
    consumerKey,
    consumerSecret,
    name: appName,
  };

  /* -------------------------- User Info ------------------------- */
  console.log('');
  print.subtitle('4. App Info');

  let tokens;
  while (!tokens) {
    console.log('Make a "tokens.json" file with an array of Canvas access tokens, one for each user to launch as');
    await prompt('Press Enter when You\'re Done');

    // Read the tokens
    try {
      tokens = JSON.parse(dropFile('tokens.json'))
    } catch (err) {
      console.log(`\nOops! An error occurred: ${err.message}`);
      await prompt('Press Enter to Try Again');
    }
  }

  /* --------------------------- Working -------------------------- */
  console.log('');
  print.subtitle('Working...');
  console.log('Downloading User Profiles from Canvas');

  // Create APIs out of each token
  const apis = tokens.map((accessToken) => {
    return initCACCL({
      canvasHost,
      accessToken,
    });
  });

  // Get user profiles
  const promises = apis.map((api) => {
    return api.user.self.getProfile()
      .then((profile) => {
        // Get enrollments so we can figure out their role
        return new Promise((resolve) => {
          api.course.getUser({
            courseId: course.id,
            userId: profile.id,
            includeEnrollments: true,
          })
            .then((user) => {
              const enrollments = (user.enrollments || []);

              // Add role
              profile.isStudent = enrollments.some((enrollment) => {
                return enrollment.type.toLowerCase().startsWith('student');
              });
              profile.isTeacher = enrollments.some((enrollment) => {
                return enrollment.type.toLowerCase().startsWith('teacher');
              });

              // Finish
              resolve(profile);
            })
        });
      });
    return ;
  });
  const profiles = await Promise.all(promises);

  // Process profiles into user objects
  const users = profiles.map((profile) => {
    return {
      id: profile.id,
      sortableName: profile.sortable_name,
      profileURL: profile.avatar_url,
      sisId: profile.login_id,
      email: profile.primary_email || profile.email,
      isStudent: profile.isStudent,
      isTeacher: profile.isTeacher,
    };
  });

  /* ----------------------- Create the File ---------------------- */

  const body = {
    course,
    users,
    app,
    canvasHost,
  };

  // JSONify
  const bodyStr = JSON.stringify(body, null, 2);

  console.log('Writing launchData.json');

  // Save to file
  fs.writeFileSync(
    path.join(__dirname, '../launchData.json'),
    bodyStr,
    'utf-8'
  );

  /* ---------------------------- Done ---------------------------- */

  console.log('');
  print.title('Done!');

  console.log('\nIf any of your users are Admins, manually add the "isAdmin" boolean as true.\n');
};

run();
