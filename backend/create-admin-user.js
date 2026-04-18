require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/mongo/User');

async function main() {
  const admin = {
    name: 'Feriwala Admin',
    email: 'admin@feriwala.com',
    phone: '+919999999901',
    loginId: 'adminferiwala',
    password: 'FwAdmin@2026!'
  };

  await mongoose.connect(process.env.MONGODB_URI);

  let user = await User.findOne({
    $or: [
      { email: admin.email },
      { loginId: admin.loginId },
      { phone: admin.phone }
    ]
  });

  if (!user) {
    user = new User({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      loginId: admin.loginId,
      passwordHash: admin.password,
      role: 'admin',
      isActive: true,
      isVerified: true
    });
  } else {
    user.name = admin.name;
    user.email = admin.email;
    user.phone = admin.phone;
    user.loginId = admin.loginId;
    user.passwordHash = admin.password;
    user.role = 'admin';
    user.isActive = true;
    user.isVerified = true;
  }

  await user.save();

  console.log('ADMIN_READY');
  console.log(`email=${admin.email}`);
  console.log(`loginId=${admin.loginId}`);
  console.log(`phone=${admin.phone}`);
  console.log('role=admin');

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('ADMIN_CREATE_ERROR');
  console.error(err.message);
  try {
    await mongoose.disconnect();
  } catch (_) {
    // ignore
  }
  process.exit(1);
});
