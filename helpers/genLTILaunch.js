const randomstring = require('randomstring');

/**
 * Replace all occurrences in a string
 * @author Gabe Abrams
 * @param {string} str - the string to search
 * @param {string} search - the fragment to search for
 * @param {string} replacement - the fragment to replace when search is found
 * @return {string} the string with its replacements made
 */
const replaceAll = (str, search, replacement) => {
  return str.replace(new RegExp(search, 'g'), replacement);
};

/**
 * Generates an LTI launch body
 * @author Gabe Abrams
 * 
 * @param {object} [user] - a user info object
 * @param {string} [user.sortableName] - the name of the user who is launching
 * @param {string} [user.email] - the email of the user who is launching
 * @param {string|number} [user.sisId] - the sis id for the user
 * @param {string} [user.imageURL] - a url for the profile image of the user
 * @param {boolean} [user.isStudent] - true if the user is a student
 * @param {boolean} [user.isTeacher] - true if the user is a teacher
 * @param {boolean} [user.isAdmin] - true if the user is an admin
 * 
 * @param {object} [course] - a course info object
 * @param {string} [course.name] - the name of the course
 * @param {string} [course.code] - the code for the course
 * @param {number} [course.id] - the Canvas id for the course
 * 
 * @param {object} [app] - an app info object
 * @param {string} [app.name] - the name of the app
 * 
 * @param {string} [canvasHost] - the hostname of Canvas
 * 
 * @return {object} launch body
 */
module.exports = (options) => {
  // Add objects so nothing crashes
  options.course = options.course || {};
  options.user = options.user || {};
  options.app = options.app || {};

  // Get the first and last name from the profile
  const [last, first] = (options.user.sortableName || 'User, Test').split(', ');

  // Prep roles
  const extRoles = [];
  const roles = [];
  if (options.user.isTeacher) {
    // Ext roles
    extRoles.push('urn:lti:instrole:ims/lis/Instructor');
    extRoles.push('urn:lti:role:ims/lis/Instructor');
    extRoles.push('urn:lti:sysrole:ims/lis/User');
    // Depricated roles
    roles.push('Instructor');
  }
  if (options.user.isAdmin) {
    // Ext roles
    extRoles.push('urn:lti:instrole:ims/lis/Administrator');
    // Depricated roles
    roles.push('urn:lti:instrole:ims/lis/Administrator');
  }
  if (
    options.user.isStudent
    || (
      // No role
      !options.user.isTeacher
      && !options.user.isAdmin
      && !options.user.isStudent
    )
  ) {
    // Ext roles
    extRoles.push('urn:lti:instrole:ims/lis/Student');
    extRoles.push('urn:lti:role:ims/lis/Learner');
    extRoles.push('urn:lti:sysrole:ims/lis/User');
    // Depricated roles
    roles.push('Learner');
  }

  // Create a fake context id
  const contextId = `fakeuuid-${randomstring.generate(48)}`;

  // Create LTI launch body
  const body = {};

  body.oauth_nonce = `${randomstring.generate(48)}${Date.now()}`;
  body.oauth_timestamp = Math.round(Date.now() / 1000);
  body.context_id = contextId;
  body.context_label = options.course.code || 'CRS 57';
  body.context_title = options.course.name || 'My Course';
  body.custom_canvas_api_domain = options.canvasHost || 'canvas.harvard.edu';
  body.custom_canvas_course_id = options.course.id || 51483;
  body.custom_canvas_enrollment_state = 'active';
  body.custom_canvas_user_id = options.user.id || 127582;
  body.custom_canvas_user_login_id = options.user.sisId || 8592093;
  body.custom_canvas_workflow_state = 'available';
  body.ext_roles = extRoles.join(',');
  body.launch_presentation_document_target = 'window';
  body.launch_presentation_height = null; // Not applicable
  body.launch_presentation_locale = 'en';
  body.launch_presentation_return_url = null; // We can't get this
  body.launch_presentation_width = null; // Not applicable
  body.lis_person_contact_email_primary = options.user.email || 'someone@example.edu';
  body.lis_person_name_family = last;
  body.lis_person_name_full = `${first} ${last}`;
  body.lis_person_name_given = first;
  body.lis_person_sourcedid = options.user.sisId || 8592093;
  body.lti_message_type = 'basic-lti-launch-request';
  body.lti_version = 'LTI-1p0';
  body.oauth_callback = 'about:blank';
  body.resource_link_id = contextId;
  body.resource_link_title = options.app.name || 'Unnamed App';
  body.roles = roles.join(',');
  body.tool_consumer_info_product_family_code = 'canvas';
  body.tool_consumer_info_version = 'cloud';
  body.tool_consumer_instance_contact_email = 'notifications@instructure.com';
  body.tool_consumer_instance_guid = null; // We can't get this
  body.tool_consumer_instance_name = `Canvas instance at ${options.canvasHost || 'canvas.harvard.edu'}`;
  body.user_id = options.user.id || 127582;
  body.user_image = (
    options.user.imageURL
    || 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50'
  ); // Fake image of a person

  return body;
};