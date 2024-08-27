/* eslint-disable @typescript-eslint/no-explicit-any */

import httpStatus from 'http-status';
import { IUser } from './user.interface';
import ApiError from '../../errors/ApiError';
import { User } from './user.model';
import QueryBuilder from '../../builder/QueryBuilder';
import {
  monthNames,
  userFieldsToExclude,
  UserSearchableFields,
} from './user.constant';
import { JwtPayload } from 'jsonwebtoken';
import path from 'path';
import ejs from 'ejs';
import cron from 'node-cron';
import generateRandomNumber from '../../helpers/generateRandomNumber';
import unlinkFile from '../../helpers/unlinkFile';
import { errorLogger, logger } from '../../utils/winstonLogger';
import colors from 'colors';
import { sendEmail } from '../../helpers/emailService';
import { startOfMonth, endOfMonth } from 'date-fns';

const createUserToDB = async (payload: IUser) => {
  // Check if a user with the provided email already exists
  if (await User.isUserExistsByEmail(payload?.email)) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'A user with this email already exists!',
    );
  }

  // Set default values for new users
  payload.role = 'user';
  payload.status = 'in-progress';
  payload.isBlocked = false;
  payload.isDeleted = false;

  // Generate OTP and set expiration for email verification
  const otp = generateRandomNumber();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

  // Add OTP and expiration time to the payload
  payload.otp = Number(otp);
  payload.otpExpiresAt = otpExpiresAt;

  // Path to the email verification template
  const verifyEmailTemplatePath = path.join(
    process.cwd(),
    'src',
    'app',
    'templates',
    'verifyEmailTemplate.ejs',
  );

  // Render the email template with user's name and OTP
  const verifyEmailTemplate = await ejs.renderFile(verifyEmailTemplatePath, {
    fullName: payload.fullName,
    otp,
  });

  // Email options for sending the verification email
  const emailOptions = {
    to: payload.email, // Receiver's email address (user's email)
    subject: 'Verify Your Email Address - Roomz', // Subject of the email
    html: verifyEmailTemplate, // HTML content of the email
  };

  // Send the verification email to the user
  await sendEmail(emailOptions);

  // Create the new user in the database
  const result = User.create(payload);
  return result;
};

const createAdminToDB = async (payload: IUser) => {
  // Check if a user with the provided email already exists
  if (await User.isUserExistsByEmail(payload?.email)) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'An admin with this email already exists!',
    );
  }

  // Set default values for new admins
  payload.role = 'admin';
  payload.status = 'active';
  payload.isVerified = true;
  payload.isBlocked = false;
  payload.isDeleted = false;

  // Create the new admin in the database
  const result = User.create(payload);
  return result;
};

const getUsersFromDB = async (query: Record<string, unknown>) => {
  // Build the query using QueryBuilder with the given query parameters
  const usersQuery = new QueryBuilder(User.find({ role: 'user' }), query)
    .search(UserSearchableFields) // Apply search conditions based on searchable fields
    .sort() // Apply sorting based on the query parameter
    .paginate() // Apply pagination based on the query parameter
    .fields(); // Select specific fields to include/exclude in the result

  // Get the total count of matching documents and total pages for pagination
  const meta = await usersQuery.countTotal();
  // Execute the query to retrieve the users
  const result = await usersQuery.modelQuery;

  return { meta, result };
};

const getVerifiedUsersCountFromDB = async () => {
  const totalUser = await User.countDocuments({
    role: 'user',
    isVerified: true,
  });

  // Define start and end dates for the current month
  const start = startOfMonth(new Date());
  const end = endOfMonth(new Date());

  // Count users created in the current month
  const currentMonthTotal = await User.countDocuments({
    role: 'user',
    isVerified: true,
    createdAt: {
      $gte: start,
      $lte: end,
    },
  });

  return { totalUser, currentMonthTotal };
};

const getUserCountByYearFromDB = async (year: number) => {
  const monthlyUserCounts = [];

  for (let month = 1; month <= 12; month++) {
    // Define the start and end dates for the current month
    const startDate = startOfMonth(new Date(year, month - 1, 1));
    const endDate = endOfMonth(new Date(year, month - 1, 1));

    // Aggregate user counts for the specified month
    const userCount = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          role: 'user',
          isVerified: true,
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]);

    // Add the result to monthly User Counts
    monthlyUserCounts.push({
      month: monthNames[month - 1],
      totalUser: userCount?.length > 0 ? userCount[0].count : 0,
    });
  }

  return monthlyUserCounts;
};

const getAdminsFromDB = async (query: Record<string, unknown>) => {
  // Build the query using QueryBuilder with the given query parameters
  const usersQuery = new QueryBuilder(User.find({ role: 'admin' }), query)
    .sort() // Apply sorting based on the query parameter
    .paginate() // Apply pagination based on the query parameter
    .fields(); // Select specific fields to include/exclude in the result

  // Get the total count of matching documents and total pages for pagination
  const meta = await usersQuery.countTotal();
  // Execute the query to retrieve the users
  const result = await usersQuery.modelQuery;

  return { meta, result };
};

const getUserProfileFromDB = async (user: JwtPayload) => {
  const options = { includeRole: true };
  const result = await User.findById(user?.userId);

  // Convert user document to JSON if it exists
  if (result) {
    return result.toJSON(options);
  }

  // Handle case where no User is found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `User with ID: ${user?.userId} not found!`,
    );
  }
};

const updateUserProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>,
  files: any,
) => {
  // Find the existing user to get the current avatar path
  const existingUser = await User.findById(user?.userId);

  // Handle avatar update if a new avatar is uploaded
  if (files?.avatar && files?.avatar?.length > 0) {
    const newAvatarPath = files?.avatar[0]?.path.replace(/\\/g, '/'); // Replace backslashes with forward slashes
    payload.avatar = newAvatarPath;

    // Delete the old avatar file if it exists and is not the default
    if (
      existingUser?.avatar &&
      existingUser?.avatar !== 'https://i.ibb.co/z5YHLV9/profile.png'
    ) {
      unlinkFile(existingUser?.avatar);
    }
  }

  // Handle cover image update if a new cover image is uploaded
  if (files?.coverImage && files?.coverImage?.length > 0) {
    const newCoverImagePath = files?.coverImage[0]?.path.replace(/\\/g, '/'); // Replace backslashes with forward slashes
    payload.coverImage = newCoverImagePath;

    // Delete the old cover image file if it exists and is not the default
    if (
      existingUser?.coverImage &&
      existingUser?.coverImage !== 'https://i.ibb.co/z5YHLV9/profile.png'
    ) {
      unlinkFile(existingUser?.coverImage);
    }
  }

  // Exclude specific fields from being updated
  userFieldsToExclude.forEach((field) => delete payload[field]);

  // Update user profile with the filtered data and return the result
  const result = await User.findByIdAndUpdate(user?.userId, payload, {
    new: true,
  });

  return result;
};

// Schedule a cron job to delete expired, unverified users every 12 hours
cron.schedule('0 */12 * * *', async () => {
  const now = new Date();

  try {
    const result = await User.deleteMany({
      otpExpiresAt: { $lt: now }, // Condition 1: OTP has expired
      status: 'in-progress', // Condition 2: User registration is in-progress
      isVerified: false, // Condition 3: User is not verified
    });

    // Log results of the deletion operation using custom logger with colors
    if (result?.deletedCount > 0) {
      logger.info(
        colors.bgGreen(
          `${result?.deletedCount} expired unverified users were deleted.`,
        ),
      );
    } else {
      logger.info(
        colors.bgYellow('No expired unverified users found for deletion.'),
      );
    }
  } catch (error) {
    errorLogger.error(colors.bgRed(`Error deleting expired users: ${error}`));
  }
});

export const UserServices = {
  createUserToDB,
  createAdminToDB,
  getUsersFromDB,
  getVerifiedUsersCountFromDB,
  getUserCountByYearFromDB,
  getAdminsFromDB,
  getUserProfileFromDB,
  updateUserProfileToDB,
};
