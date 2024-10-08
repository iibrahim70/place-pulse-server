import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BookingServices } from './booking.service';

const confirmBooking = catchAsync(async (req, res) => {
  const result = await BookingServices.confirmBookingToDB(
    req?.user,
    req?.body,
    req?.params?.propertyId,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Booking confirmed successfully!',
    data: result,
  });
});

const getBookingsHistory = catchAsync(async (req, res) => {
  const result = await BookingServices.getBookingsHistoryFromDB(req?.query);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Bookings history retrived successfully!',
    data: result,
  });
});

export const BookingControllers = {
  confirmBooking,
  getBookingsHistory,
};
