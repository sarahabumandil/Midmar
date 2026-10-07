import { User } from '../models/User.js';

// Initialize admin user if not present
export const initializeAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@footbrain.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const admin = new User({
        email: adminEmail,
        password: adminPassword,
        name: 'Admin',
        role: 'admin',
      });
      await admin.save();
      console.log('✅ Admin user created:', adminEmail);
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
    // rethrowing would fail server start; keep behavior as before (log only)
  }
};
