/* eslint-disable @typescript-eslint/no-explicit-any */

import { JwtPayload } from 'jsonwebtoken';
import { IFeedback } from './feedback.interface';
import { Feedback } from './feedback.model';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import { Property } from '../Property/property.model';
import { User } from '../User/user.model';
import getPathAfterUploads from '../../helpers/getPathAfterUploads';

const createFeedbackToDB = async (
  user: JwtPayload,
  payload: IFeedback,
  file: any,
) => {
  // Check if the property with the provided propertyId exists
  const propertyExists = await Property.findById(payload?.propertyId);

  // Handle case where no Feedback is found
  if (!propertyExists) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Property with ID: ${payload?.propertyId} not found!`,
    );
  }

  payload.userId = user?.userId; // Set the userId field from the JWT payload
  payload.visibilityStatus = 'hide'; // Set default status for the Feedback

  if (file && file?.path) {
    payload.image = getPathAfterUploads(file?.path);
  }

  const result = await Feedback.create(payload);
  return result;
};

const getAllFeedbacksFromDB = async (query: Record<string, unknown>) => {
  // Build the query using QueryBuilder with the given query parameters
  const reviewsQuery = new QueryBuilder(
    Feedback.find().populate({
      path: 'userId',
      select: 'fullName avatar',
    }),
    query,
  )
    .sort() // Apply sorting based on the query parameter
    .paginate() // Apply pagination based on the query parameter
    .fields(); // Select specific fields to include/exclude in the result

  // Get the total count of matching documents and total pages for pagination
  const meta = await reviewsQuery.countTotal();
  // Execute the query to retrieve the reviews
  const result = await reviewsQuery.modelQuery;

  return { meta, result };
};

const getVisibleFeedbacksFromDB = async () => {
  // Build the query using QueryBuilder with the given query parameters
  const result = Feedback.find({ visibilityStatus: 'show' }).populate({
    path: 'userId',
    select: 'fullName avatar',
  });

  return result;
};

const getUserProfileFeedbacksFromDB = async (userId: string) => {
  // Find properties posted by the user
  const properties = await Property.find({ createdBy: userId });

  // Extract property IDs
  const propertyIds = properties?.map((property) => property?._id);

  // Find feedback for these properties and populate the property owner data
  const result = await Feedback.find({
    propertyId: { $in: propertyIds },
  }).populate({
    path: 'userId', // Populate the user who gave the feedback
    select: '-_id fullName avatar', // Adjust the fields to select the user's details
  });

  return result;
};

const getUserProfileFeedbackSummaryFromDB = async (userId: string) => {
  // Fetch user profile
  const existingUser = await User.findById(userId).select(
    '-_id fullName email avater coverImage address',
  ); // Adjust fields as necessary

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found!');
  }

  // Find properties posted by the user
  const properties = await Property.find({ createdBy: userId });

  // Extract property IDs
  const propertyIds = properties?.map((property) => property?._id);

  // Find feedback for these properties
  const feedbacks = await Feedback.find({
    propertyId: { $in: propertyIds },
  });

  // Calculate the average rating given by the user
  const userRatings = feedbacks?.map((feedback) => feedback?.rating);
  const averageRating =
    userRatings?.length > 0
      ? (
          userRatings?.reduce((sum, rating) => sum + rating, 0) /
          userRatings?.length
        ).toFixed(1)
      : 0;

  // Return user profile and average rating
  return {
    userInfo: existingUser,
    averageRating,
  };
};

const updateFeedbackVisibilityStatusToDB = async (
  feedbackId: string,
  payload: { visibilityStatus: 'show' | 'hide' },
) => {
  // Validate visibility status
  if (
    payload?.visibilityStatus !== 'show' &&
    payload?.visibilityStatus !== 'hide'
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid visibility status! Must be 'show' or 'hide'.`,
    );
  }

  // Update the Feedback status
  const result = await Feedback.findByIdAndUpdate(feedbackId, {
    visibilityStatus: payload?.visibilityStatus,
  });

  // Handle case where no Feedback is found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Feedback with ID: ${feedbackId} not found!`,
    );
  }
};

export const FeedbackServices = {
  createFeedbackToDB,
  getAllFeedbacksFromDB,
  getVisibleFeedbacksFromDB,
  updateFeedbackVisibilityStatusToDB,
  getUserProfileFeedbacksFromDB,
  getUserProfileFeedbackSummaryFromDB,
};
