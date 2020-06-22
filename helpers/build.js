const clear = require('clear');
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
  clear();
  print.title('LTI Launch Artillery | Test Builder');

  // Test name
  console.log('\nWhat do you want to name your test file?');
  let filename = await prompt('Filename: ', true);
  if (!filename.endsWith('.json')) {
    filename = `${filename}.json`;
  }
  filename = path.join(
    process.env.PWD,
    filename
  )

  // Rest of intro

  console.log(`\nWe are going to create/overwrite this file:\n${filename}`);
  console.log('\nPress Enter to Continue');
  await prompt();

  /* ------------------------  Canvas Info ------------------------ */
  console.log('');
  print.subtitle('1. Canvas Info');

  const canvasHost = await prompt('Canvas Host: ', true);

  /* ------------------------- Course Info ------------------------ */
  console.log('');
  print.subtitle('2. Course Info');

  const courseId = await prompt('Course Canvas Id: ', true);
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
  const launchURL = await prompt('Launch URL: ', true);
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
  print.subtitle('4. User Info');

  console.log('Make a JSON file with an array of Canvas tokens, one for each test user.')
  await prompt('Press Enter to Continue');

  const tokens = await dropFile('JSON');

  /* --------------------------- Working -------------------------- */
  print.title('Working...');
  console.log('\nDownloading User Profiles from Canvas');

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
    filename,
    bodyStr,
    'utf-8'
  );

  /* ---------------------------- Done ---------------------------- */

  console.log('');
  print.title('Done!');

  console.log('\nIf any of your users are Admins, manually add the "isAdmin" boolean as true.\n');
};

run();
