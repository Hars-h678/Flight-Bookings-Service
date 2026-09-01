const axios = require('axios');

const { StatusCodes } = require('http-status-codes');

const AppError = require('../utils/errors/app-error');

const {BookingRepository} = require('../repositories');
const db = require('../models');
const { ServerConfig } = require('../config');
const { Enums } = require('../utils/common');
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS
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
// now see by default booking status is INITIATED now since if for a particular period of time if the payment is not done then we will cancel the booking and the seats which are kept reserved will be released but we will implement that later
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




async function makePayment(data){
    const transaction = await db.sequelize.transaction();
    try{
        const bookingDetail = await bookingRepository.get(data.bookingId, transaction)
        const bookingTime = new Date(bookingDetail.createdAt);
       const currentTime = new Date();
       if(currentTime - bookingTime > 300000 ){ //means 5 minutes
             console.log(CANCELLED);
           //  await bookingRepository.update(data.bookingId , {status:CANCELLED}, transaction);
             //why my above status :CANCELLED is not updating in the database ? ans: bcz we are not committing the transaction so we need to commit the transaction after updating the status 
             await cancelBooking({bookingId: data.bookingId, flightId: bookingDetail.flightId, noOfSeats: bookingDetail.noOfSeats});
             throw new AppError('Payment time expired',StatusCodes.BAD_REQUEST);
             await transaction.commit();
             // see if status is cancelled then we will commit it in cancelbooking right then it should commit and come back to this function and then we will throw the error and the transaction will be rolled back but the status will be cancelled in the database
      // so according to you commit will alwyas in every situation will  throw error
            }

        if(bookingDetail.totalCost !== data.totalCost){
            throw new AppError('Total cost is not correct',StatusCodes.BAD_REQUEST);
        }
        if(bookingDetail.userId !== data.userId)
        {
            throw new AppError('User is not authorized to make payment for this booking',StatusCodes.UNAUTHORIZED);
        }

        const response = await bookingRepository.update(data.bookingId , {status:BOOKED}, transaction);
        await transaction.commit();
    }catch(error){
      await transaction.rollback();
      throw error;
    }

}

async function cancelBooking(data){
  const transaction = await db.sequelize.transaction();
  try{
    const bookingDetail = await bookingRepository.get(data.bookingId, transaction)
    console.log("booking detail", bookingDetail);
    if(bookingDetail.status == CANCELLED){
        await transaction.commit();
        return;
    }
    const seats = bookingDetail.noOfSeats;
    await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetail.flightId}/seats`,{
        seats: bookingDetail.noOfSeats,
        dec:true
       });
    await bookingRepository.update(data.bookingId , {status:CANCELLED}, transaction);
    await transaction.commit();
  }catch(error){
     await transaction.rollback();
      throw error;
  }
}

module.exports = {
    createBooking,
    makePayment,
    cancelBooking
};