import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { User } from '../modules/User/user.model';
import catchAsync from '../helpers/catchAsync';
import ApiError from '../errors/ApiError';
import { TUserRole } from '../modules/User/user.interface';
import { verifyJwtToken } from '../helpers/jwtHelpers';

const validateAuth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const bearerToken = req?.headers?.authorization;

    // checking if the token is missing
    if (!bearerToken) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
    }

    if (bearerToken && bearerToken.startsWith('Bearer')) {
      const token = bearerToken.split(' ')[1];

      // checking if the given token is valid
      const verifyUser = verifyJwtToken(
        token,
        config.jwtAccessSecret as string,
      );

      // Check if a user with the provided email exists in the database
      const existingUser = await User.isUserExistsByEmail(verifyUser?.email);

      // If no user is found with the given email, throw a NOT_FOUND error
      if (!existingUser) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          'User with this email does not exist!',
        );
      }

      // If the user is not verified, throw a FORBIDDEN error
      if (!existingUser?.isVerified) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'User account is not verified!',
        );
      }

      // If the user is blocked, throw a FORBIDDEN error.
      if (existingUser?.isBlocked) {
        throw new ApiError(httpStatus.FORBIDDEN, 'User account is blocked!');
      }

      // If the user is deleted, throw a FORBIDDEN error.
      if (existingUser?.isDeleted) {
        throw new ApiError(httpStatus.FORBIDDEN, 'User account is deleted.');
      }

      if (
        existingUser.passwordChangedAt &&
        (await User.isJWTIssuedBeforePasswordChanged(
          existingUser?.passwordChangedAt,
          verifyUser?.iat as number,
        ))
      ) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }

      if (requiredRoles && !requiredRoles.includes(verifyUser?.role)) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }

      req.user = verifyUser as JwtPayload;
      next();
    }
  });
};

export default validateAuth;
