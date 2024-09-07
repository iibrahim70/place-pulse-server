import config from '../config';
import bcrypt from 'bcrypt';
import { User } from '../modules/User/user.model';
import { errorLogger, logger } from '../utils/winstonLogger';
import colors from 'colors';

const data = [
  {
    fullName: 'John Doe',
    email: 'johndoe@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    coverImage: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
    phoneNumber: '+1234567890',
    nidNumber: 123456789,
    ineNumber: 987654321,
    gender: 'male',
    password: 'password',
    permanentAddress: '123 Permanent St, Springfield, USA',
    presentAddress: '456 Present Ave, Springfield, USA',
    role: 'USER',
    status: 'active',
    isVerified: true,
  },
  {
    fullName: 'Jane Smith',
    email: 'janesmith@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    coverImage: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
    phoneNumber: '+1987654321',
    nidNumber: 234567890,
    ineNumber: 876543210,
    gender: 'female',
    password: 'password',
    permanentAddress: '789 Permanent Ln, Metropolis, USA',
    presentAddress: '101 Present Rd, Metropolis, USA',
    role: 'USER',
    status: 'active',
    isVerified: true,
  },
  {
    fullName: 'Robert Johnson',
    email: 'robertjohnson@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    coverImage: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
    phoneNumber: '+1324567890',
    nidNumber: 345678901,
    ineNumber: 765432109,
    gender: 'male',
    password: 'password',
    permanentAddress: '321 Permanent Dr, Gotham, USA',
    presentAddress: '654 Present St, Gotham, USA',
    role: 'USER',
    status: 'active',
    isVerified: true,
  },
  {
    fullName: 'Emily Davis',
    email: 'emilydavis@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    coverImage: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
    phoneNumber: '+1456789123',
    nidNumber: 456789012,
    ineNumber: 654321098,
    gender: 'female',
    password: 'password',
    permanentAddress: '567 Permanent Way, Star City, USA',
    presentAddress: '123 Present Ave, Star City, USA',
    role: 'USER',
    status: 'active',
    isVerified: true,
  },
  {
    fullName: 'Michael Brown',
    email: 'michaelbrown@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    coverImage: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
    phoneNumber: '+1567890345',
    nidNumber: 567890123,
    ineNumber: 543210987,
    gender: 'male',
    password: 'password',
    permanentAddress: '789 Permanent Cir, Central City, USA',
    presentAddress: '456 Present Blvd, Central City, USA',
    role: 'USER',
    status: 'active',
    isVerified: true,
  },
  {
    fullName: 'Sophia Taylor',
    email: 'sophiataylor@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    coverImage: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
    phoneNumber: '+1678903456',
    nidNumber: 678901234,
    ineNumber: 432109876,
    gender: 'female',
    password: 'password',
    permanentAddress: '123 Permanent Rd, Coast City, USA',
    presentAddress: '789 Present Ln, Coast City, USA',
    role: 'USER',
    status: 'active',
    isVerified: true,
  },
  {
    fullName: 'James Wilson',
    email: 'jameswilson@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    coverImage: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
    phoneNumber: '+1789034567',
    nidNumber: 789012345,
    ineNumber: 321098765,
    gender: 'male',
    password: 'password',
    permanentAddress: '456 Permanent Ave, National City, USA',
    presentAddress: '101 Present Cir, National City, USA',
    role: 'USER',
    status: 'active',
    isVerified: true,
  },
  {
    fullName: 'Isabella Martinez',
    email: 'isabellamartinez@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    coverImage: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
    phoneNumber: '+1890345678',
    nidNumber: 89123456,
    ineNumber: 210987654,
    gender: 'female',
    password: 'password',
    permanentAddress: '789 Permanent Blvd, Keystone City, USA',
    presentAddress: '456 Present Way, Keystone City, USA',
    role: 'USER',
    status: 'active',
    isVerified: true,
  },
  {
    fullName: 'Ethan Anderson',
    email: 'ethananderson@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    coverImage: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
    phoneNumber: '+1903456789',
    nidNumber: 901234567,
    ineNumber: 109876543,
    gender: 'male',
    password: 'password',
    permanentAddress: '123 Permanent St, Gotham, USA',
    presentAddress: '789 Present Rd, Gotham, USA',
    role: 'USER',
    status: 'active',
    isVerified: true,
  },
  {
    fullName: 'Ava Thomas',
    email: 'avathomas@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    coverImage: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
    phoneNumber: '+2012345678',
    nidNumber: 123456780,
    ineNumber: 987654320,
    gender: 'female',
    password: 'password',
    permanentAddress: '456 Permanent Ln, Metropolis, USA',
    presentAddress: '321 Present Blvd, Metropolis, USA',
    role: 'USER',
    status: 'active',
    isVerified: true,
  },
  {
    fullName: 'Liam Scott',
    email: 'liamscott@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    coverImage: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
    phoneNumber: '+2123456789',
    nidNumber: 234567890,
    ineNumber: 876543210,
    gender: 'male',
    password: 'password',
    permanentAddress: '789 Permanent Cir, Central City, USA',
    presentAddress: '654 Present St, Central City, USA',
    role: 'USER',
    status: 'active',
    isVerified: true,
  },
  {
    fullName: 'Mia Harris',
    email: 'miaharris@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    coverImage: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
    phoneNumber: '+2234567890',
    nidNumber: 345678901,
    ineNumber: 765432109,
    gender: 'female',
    password: 'password',
    permanentAddress: '123 Permanent Rd, Coast City, USA',
    presentAddress: '456 Present Way, Coast City, USA',
    role: 'USER',
    status: 'active',
    isVerified: true,
  },
  {
    fullName: 'Lucas White',
    email: 'lucaswhite@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    coverImage: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
    phoneNumber: '+2345678901',
    nidNumber: 456789012,
    ineNumber: 654321098,
    gender: 'male',
    password: 'password',
    permanentAddress: '567 Permanent Cir, National City, USA',
    presentAddress: '101 Present Ln, National City, USA',
    role: 'USER',
    status: 'active',
    isVerified: true,
  },
  {
    fullName: 'Grace Clark',
    email: 'graceclark@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    coverImage: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
    phoneNumber: '+2456789012',
    nidNumber: 567890123,
    ineNumber: 543210987,
    gender: 'female',
    password: 'password',
    permanentAddress: '789 Permanent Blvd, Gotham, USA',
    presentAddress: '654 Present Cir, Gotham, USA',
    role: 'USER',
    status: 'active',
    isVerified: true,
  },
  {
    fullName: 'Benjamin King',
    email: 'benjaminking@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    coverImage: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
    phoneNumber: '+2567890123',
    nidNumber: 678901234,
    ineNumber: 432109876,
    gender: 'male',
    password: 'password',
    permanentAddress: '123 Permanent Ln, Metropolis, USA',
    presentAddress: '789 Present Cir, Metropolis, USA',
    role: 'USER',
    status: 'active',
    isVerified: true,
  },
  {
    fullName: 'Amelia Hill',
    email: 'ameliahill@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    coverImage: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
    phoneNumber: '+2678901234',
    nidNumber: 789012345,
    ineNumber: 321098765,
    gender: 'female',
    password: 'password',
    permanentAddress: '456 Permanent Way, Central City, USA',
    presentAddress: '321 Present Ln, Central City, USA',
    role: 'USER',
    status: 'active',
    isVerified: true,
  },
  {
    fullName: 'Alexander Turner',
    email: 'alexanderturner@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    coverImage: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
    phoneNumber: '+2789012345',
    nidNumber: 89123456,
    ineNumber: 210987654,
    gender: 'male',
    password: 'password',
    permanentAddress: '789 Permanent St, Coast City, USA',
    presentAddress: '654 Present Cir, Coast City, USA',
    role: 'USER',
    status: 'active',
    isVerified: true,
  },
  {
    fullName: 'Harper Lewis',
    email: 'harperlewis@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    coverImage: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
    phoneNumber: '+2890123456',
    nidNumber: 901234567,
    ineNumber: 109876543,
    gender: 'female',
    password: 'password',
    permanentAddress: '123 Permanent Ave, Star City, USA',
    presentAddress: '789 Present Way, Star City, USA',
    role: 'USER',
    status: 'active',
    isVerified: true,
  },
  {
    fullName: 'Daniel Walker',
    email: 'danielwalker@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    coverImage: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
    phoneNumber: '+2901234567',
    nidNumber: 123456789,
    ineNumber: 987654321,
    gender: 'male',
    password: 'password',
    permanentAddress: '456 Permanent Blvd, Gotham, USA',
    presentAddress: '123 Present Cir, Gotham, USA',
    role: 'USER',
    status: 'active',
    isVerified: true,
  },
  {
    fullName: 'Ella Wright',
    email: 'ellawright@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    coverImage: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8',
    phoneNumber: '+3012345678',
    nidNumber: 234567890,
    ineNumber: 876543210,
    gender: 'female',
    password: 'password',
    permanentAddress: '789 Permanent Ave, Keystone City, USA',
    presentAddress: '456 Present Cir, Keystone City, USA',
    role: 'USER',
    status: 'active',
    isVerified: true,
  },
];

// Function to hash passwords and insert users into the database
const seedUsers = async () => {
  try {
    // Hash passwords for each user
    const hashedUsers = await Promise.all(
      data?.map(async (user) => {
        const hashedPassword = await bcrypt.hash(
          user.password,
          Number(config.bcryptSaltRounds),
        );
        return { ...user, password: hashedPassword }; // Replace plain password with hashed one
      }),
    );

    // Check if there are less than 20 users in the database
    const userCounts = await User.countDocuments();

    if (userCounts < 20) {
      // Bulk insert the users with hashed passwords
      await User.insertMany(hashedUsers);
      logger.info(colors.bgGreen.bold('✅ Users inserted successfully!'));
    } else {
      logger.warn(colors.bgYellow.bold('⚠️ User count is already 20 or more!'));
    }
  } catch (error) {
    errorLogger.error(colors.bgRed.bold(`❌ Error inserting users:, ${error}`));
  }
};

export default seedUsers;
