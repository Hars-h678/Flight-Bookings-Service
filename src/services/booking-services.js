const axios = require('axios');

const { StatusCodes } = require('http-status-codes');

const AppError = require('../utils/errors/app-error');

const {BookingRepository} = require('../repositories');
const db = require('../models');
const { ServerConfig } = require('../config');

const bookingRepository = new BookingRepository();


async function createBooking(bookingData) {
    const transaction = await db.sequelize.transaction();
    // see this transaction is unused right now bcz we are not doing any db operation 
    try{
         const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingData.flightId}`);
         console.log("flight data", flight.data);
         if(bookingData.noOfSeats > flight.data.data.totalSeats){
            throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
         }
         // now see how to do boooking
         const billingAmount = flight.data.data.price * bookingData.noOfSeats;
         
         const bookingPayload = {...bookingData , totalCost: billingAmount};
         console.log("booking payload", bookingPayload);
         const booking = await bookingRepository.createBooking(bookingPayload,  transaction);
// now see adefault booking status is INITATED now since if for a particular perior of time if thepayment is not done then we will cancel the booking and the seats which are kept reserved will be released but we will implement that later
         console.log("booking created", booking);
       await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingData.flightId}/seats`,{
        seats: bookingData.noOfSeats,
       });
       await transaction.commit();
          return booking;
        }
    catch(error){
           await transaction.rollback(); 
           throw error;
        }
    
}

module.exports = {
    createBooking
};