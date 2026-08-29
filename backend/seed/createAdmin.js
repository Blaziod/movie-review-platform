// One-off script to create (or promote) the platform's admin account.
// There is no public admin registration
// so an admin has to be created directly against the database. Run with:
//
//   node seed/createAdmin.js "Admin Name" admin@example.com "a-strong-password"
//
// Safe to re-run: if the email already exists, it just promotes that user
// to role=admin (and updates the password) instead of erroring out.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const [, , name, email, password] = process.argv;

if (!name || !email || !password) {
  console.error('Usage: node seed/createAdmin.js "Admin Name" admin@example.com "password"');
  process.exit(1);
}

(async () => {
  await connectDB();

  let user = await User.findOne({ email });
  if (user) {
    user.name = name;
    user.password = password; 
    user.role = 'admin';
    await user.save();
    console.log(`Promoted existing user ${email} to admin.`);
  } else {
    user = await User.create({ name, email, password, role: 'admin' });
    console.log(`Created new admin account ${email}.`);
  }

  await mongoose.disconnect();
  process.exit(0);
})();
