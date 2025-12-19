const mongoose = require('mongoose');
const User = require('./src/models/User');
const Role = require('./src/models/Role'); // Ensure you've created this model
const PERMISSIONS = require('./src/config/permissions');

const MONGO_URI =
  'mongodb+srv://Webflare-User:43y1JbOEAYeqC2Dg@webflaredesignco-dev.eokqtto.mongodb.net/Webflare-Prod?appName=WebflareDesignCo-Dev';

const seedSystem = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to Database. Cleaning old data...');

    // Clear existing data to prevent ID conflicts
    await User.deleteMany({});
    await Role.deleteMany({});

    // --- STEP 1: CREATE THE DYNAMIC ROLES ---

    // Super Admin Role
    const superAdminRole = await Role.create({
      name: 'SuperAdmin',
      branch: 'admin',
      isSystemRole: true,
      permissions: [PERMISSIONS.SUPER_ADMIN],
    });

    // Cyber Analyst Role
    const cyberAnalystRole = await Role.create({
      name: 'Senior Threat Hunter',
      branch: 'cyber_security',
      permissions: [
        PERMISSIONS.CYBER_VIEW_VULNS,
        PERMISSIONS.CYBER_RUN_SCANS,
        PERMISSIONS.CYBER_MANAGE_INCIDENTS,
      ],
    });

    // Web Dev Role
    const webDevRole = await Role.create({
      name: 'Full Stack Engineer',
      branch: 'web_dev',
      permissions: [
        PERMISSIONS.WEB_VIEW_PROJECTS,
        PERMISSIONS.WEB_DEPLOY_PROD,
        PERMISSIONS.WEB_EDIT_ENV,
      ],
    });

    // --- STEP 2: CREATE THE TEST USERS ---

    const users = [
      {
        userName: 'judadmin',
        email: 'judsonwells100@gmail.com',
        firstName: 'Judson',
        lastName: 'Wells',
        password: 'Judson07190715!',
        branch: 'admin',
        role: superAdminRole._id, // Linked to Role ID
      },
      {
        userName: 'cyber_tester',
        email: 'cyber@webflare.com',
        firstName: 'Security',
        lastName: 'User',
        password: 'TestPassword123!',
        branch: 'cyber_security',
        role: cyberAnalystRole._id,
      },
      {
        userName: 'webdev_tester',
        email: 'dev@webflare.com',
        firstName: 'Developer',
        lastName: 'User',
        password: 'TestPassword123!',
        branch: 'web_dev',
        role: webDevRole._id,
      },
    ];

    for (const u of users) {
      const newUser = new User(u);
      await newUser.save();
    }

    console.log(`
      SEED SUCCESSFUL:
      - 3 Roles Created (SuperAdmin, Senior Threat Hunter, Full Stack Engineer)
      - 3 Users Created (judadmin, cyber_tester, webdev_tester)
    `);

    process.exit();
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
};

seedSystem();
