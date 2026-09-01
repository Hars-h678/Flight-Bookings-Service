const { BookingService } = require('../services')

const { StatusCodes } = require('http-status-codes');
const { SuccessResponse , ErrorResponse  } = require('../utils/common');

async function createBooking(req, res){
    try {
       console.log("req body", req.body)
        const booking = await BookingService.createBooking({
            flightId: req.body.flightId,
            userId: req.body.userId,
            noOfSeats: req.body.noOfSeats,
        })
       SuccessResponse.data = booking;
       return res
                .status(StatusCodes.CREATED)
                .json(SuccessResponse);
    } catch (error) {
      ErrorResponse.error = error;
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }
}

async function makePayment(req, res){
    try {
        const booking = await BookingService.makePayment({
            bookingId: req.body.bookingId,
            userId: req.body.userId,
            totalCost: req.body.totalCost
        });
        SuccessResponse.data = booking;
        return res
                .status(StatusCodes.OK)
                .json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse);
    }
}

  












module.exports = {
    createBooking,
    makePayment
}