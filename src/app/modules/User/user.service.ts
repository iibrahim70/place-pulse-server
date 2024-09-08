/* eslint-disable @typescript-eslint/no-explicit-any */

import httpStatus from 'http-status';
import { IUser } from './user.interface';
import ApiError from '../../errors/ApiError';
import { User } from './user.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { userFieldsToExclude, UserSearchableFields } from './user.constant';
import { JwtPayload } from 'jsonwebtoken';
import path from 'path';
import ejs from 'ejs';
import cron from 'node-cron';
import generateOtp from '../../helpers/generateOtp';
import { errorLogger, logger } from '../../utils/winstonLogger';
import colors from 'colors';
import { sendEmail } from '../../helpers/emailService';
import { Favourite } from '../Favourite/favourite.model';
import { unlinkFile } from '../../helpers/fileHandler';
import getPathAfterUploads from '../../helpers/getPathAfterUploads';

const createUserToDB = async (payload: IUser) => {
  // Check if a user with the provided email already exists
  if (await User.isUserExistsByEmail(payload?.email)) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'A user with this email already exists!',
    );
  }

  // Set default values for new users
  payload.role = 'USER';
  payload.status = 'in-progress';
  payload.isBlocked = false;
  payload.isDeleted = false;

  // Generate OTP and set expiration for email verification
  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

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
    fullName: payload?.fullName,
    otp,
  });

  // Email options for sending the verification email
  const emailOptions = {
    to: payload?.email, // Receiver's email address (user's email)
    subject: 'Verify Your Email Address - Roomz', // Subject of the email
    html: verifyEmailTemplate, // HTML content of the email
  };

  // Send the verification email to the user
  await sendEmail(emailOptions);

  // Create the new user in the database
  await User.create(payload);
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
  payload.role = 'ADMIN';
  payload.status = 'active';
  payload.isVerified = true;
  payload.isBlocked = false;
  payload.isDeleted = false;

  // Create the new admin in the database
  await User.create(payload);
};

const getUsersFromDB = async (query: Record<string, unknown>) => {
  // Build the query using QueryBuilder with the given query parameters
  const usersQuery = new QueryBuilder(
    User.find({
      role: 'USER',
      isVerified: true,
    }).select('avatar fullName email presentAddress permanentAddress status'),
    query,
  )
    .search(UserSearchableFields) // Apply search conditions based on searchable fields
    .sort() // Apply sorting based on the query parameter
    .paginate(); // Apply pagination based on the query parameter

  // Get the total count of matching documents and total pages for pagination
  const meta = await usersQuery.countTotal();
  // Execute the query to retrieve the users
  const result = await usersQuery.modelQuery;

  return { meta, result };
};

const getAdminsFromDB = async (query: Record<string, unknown>) => {
  // Build the query using QueryBuilder with the given query parameters
  const usersQuery = new QueryBuilder(
    User.find({ role: 'ADMIN' }).select('avatar fullName email status'),
    query,
  )
    .sort() // Apply sorting based on the query parameter
    .paginate(); // Apply pagination based on the query parameter

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

const getPartialUserProfileFromDB = async (payload: { userId: string }) => {
  // Fetch user profile
  const existingUser = await User.findById(payload?.userId).select(
    'fullName email avatar coverImage address rating',
  ); // Adjust fields as necessary

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found!');
  }

  return existingUser;
};

const updateUserProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>,
  files: any,
) => {
  // Find the existing user to get the current avatar path
  const existingUser = await User.findById(user?.userId);

  // Ensure the user trying to update the profile is the creator
  if (existingUser?._id?.toString() !== user?.userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You do not have permission to update this property!',
    );
  }

  // Handle avatar update if a new avatar is uploaded
  if (files && files?.avatar) {
    const newAvatarPath = getPathAfterUploads(files?.avatar[0]?.path);

    if (existingUser?.avatar !== newAvatarPath) {
      unlinkFile(existingUser?.avatar as string); // Remove the old image file
      payload.avatar = newAvatarPath; // Update the payload with the new image path
    }
  }

  // Handle cover image update if a new cover image is uploaded
  if (files && files?.coverImage) {
    const newCoverImagePath = getPathAfterUploads(files?.coverImage[0]?.path);

    if (existingUser?.coverImage !== newCoverImagePath) {
      unlinkFile(existingUser?.coverImage as string); // Remove the old image file
      payload.coverImage = newCoverImagePath; // Update the payload with the new image path
    }
  }

  // Exclude specific fields from being updated
  userFieldsToExclude?.forEach((field) => delete payload[field]);

  // Update user profile with the filtered data and return the result
  const result = await User.findByIdAndUpdate(user?.userId, payload);

  return result;
};

const getUserFavouritePropertiesFromDB = async (user: JwtPayload) => {
  // Find all favorites for the user
  const favorites = await Favourite.find({ userId: user?.userId }).populate({
    path: 'propertyId',
    select: 'propertyImages price priceType title category address createdBy', // Include createdBy field
    populate: {
      path: 'createdBy',
      select: 'avatar', // Select only the user image (avatar) field
    },
  });

  // Extract the properties from the favorite records
  const result = favorites.map((favorite) => favorite.propertyId);

  return result;
};

const updateUserStatusToDB = async (
  userId: string,
  payload: { status: 'block' | 'unblock' },
) => {
  // Check if the provided status is valid
  const validStatusTypes = new Set(['block', 'unblock']);

  if (!payload?.status || !validStatusTypes?.has(payload?.status)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Invalid or missing status provided!',
    );
  }

  // Fetch the user to check the role before updating
  const existingUser = await User.findById(userId);

  if (!existingUser) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `User with ID: ${userId} not found!`,
    );
  }

  // Check if the user is a superAdmin
  if (existingUser?.role === 'SUPER-ADMIN') {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      `Cannot update status for user with role 'superAdmin'.`,
    );
  }

  // Update user status
  if (payload?.status === 'block') {
    existingUser.status = 'blocked';
    existingUser.isBlocked = true;
  } else if (payload?.status === 'unblock') {
    existingUser.status = 'active';
    existingUser.isBlocked = false;
  }

  // Save the updated user
  await existingUser.save();

  return existingUser;
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
        colors.bgGreen.bold(
          `✅ ${result?.deletedCount} expired unverified users were deleted.`,
        ),
      );
    } else {
      logger.info(
        colors.bgYellow.bold(
          '⚠️ No expired unverified users found for deletion.',
        ),
      );
    }
  } catch (error) {
    errorLogger.error(
      colors.bgRed.bold(`❌ Error deleting expired users: ${error}`),
    );
  }
});

export const UserServices = {
  createUserToDB,
  createAdminToDB,
  getUsersFromDB,
  getAdminsFromDB,
  getUserProfileFromDB,
  getPartialUserProfileFromDB,
  updateUserProfileToDB,
  updateUserStatusToDB,
  getUserFavouritePropertiesFromDB,
};
